import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

// GET - List all knowledge base documents OR get a single document's content
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get("id");

        // If documentId is provided, get that specific document
        if (documentId) {
            const document =
                await client.conversationalAi.knowledgeBase.documents.get(
                    documentId,
                    {}
                );
            return NextResponse.json(document);
        }

        // Otherwise, list all documents
        const response = await client.conversationalAi.knowledgeBase.list({});

        return NextResponse.json({
            documents: response.documents || [],
            next_cursor: response.nextCursor || null,
            has_more: response.hasMore || false,
        });
    } catch (error) {
        console.error("Error fetching knowledge base:", error);

        // Check if it's a "not found" error
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage?.includes("not found")) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch knowledge base documents",
            },
            { status: 500 }
        );
    }
}

// POST - Create a new knowledge base document
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== "string" || !text.trim()) {
            return NextResponse.json(
                { error: "Text is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        // Step 1: Create the knowledge base document
        const response =
            await client.conversationalAi.knowledgeBase.documents.createFromText(
                {
                    text: text.trim(),
                }
            );

        // Step 2: Attach the document to the agent (if enabled)
        const shouldAttachToAgent =
            process.env.ELEVENLABS_AUTO_ATTACH_KNOWLEDGE !== "false";
        const agentId =
            process.env.ELEVENLABS_AGENT_ID ||
            "agent_6201k6shnp39eheavzgd5afg85pr";

        if (shouldAttachToAgent) {
            try {
                // Get current agent configuration
                const agent = await client.conversationalAi.agents.get(agentId);
                const current =
                    agent.conversationConfig.agent?.prompt?.knowledgeBase ?? [];

                // Check if document already exists in agent's knowledge base
                const exists = current.some(
                    (k: { id: string }) => k.id === response.id
                );

                // Only update if document doesn't already exist
                if (!exists) {
                    const newDoc = {
                        type: "file" as const,
                        id: response.id,
                        name: response.name || "",
                    };

                    const knowledgeBase = [...current, newDoc];

                    // Update agent with new knowledge base, preserving existing config
                    await client.conversationalAi.agents.update(agentId, {
                        conversationConfig: {
                            ...agent.conversationConfig,
                            agent: {
                                ...agent.conversationConfig.agent,
                                prompt: {
                                    ...agent.conversationConfig.agent?.prompt,
                                    knowledgeBase,
                                },
                            },
                        },
                    });
                }
            } catch (agentError) {
                console.error("Error attaching document to agent:", agentError);
                // Don't fail the whole request if agent attachment fails
                // The document was still created successfully
            }
        }

        return NextResponse.json({
            id: response.id,
            name: response.name,
        });
    } catch (error) {
        console.error("Error creating knowledge base document:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create knowledge base document",
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete a knowledge base document
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get("id");

        if (!documentId) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 }
            );
        }

        // Step 1: Remove document from agent's knowledge base (if enabled)
        const shouldAttachToAgent =
            process.env.ELEVENLABS_AUTO_ATTACH_KNOWLEDGE !== "false";
        const agentId =
            process.env.ELEVENLABS_AGENT_ID ||
            "agent_6201k6shnp39eheavzgd5afg85pr";

        if (shouldAttachToAgent) {
            try {
                // Get current agent configuration
                const agent = await client.conversationalAi.agents.get(agentId);
                const current =
                    agent.conversationConfig.agent?.prompt?.knowledgeBase ?? [];

                // Filter out the document being deleted
                const knowledgeBase = current.filter(
                    (k: { id: string }) => k.id !== documentId
                );

                // Only update if something was actually removed
                if (knowledgeBase.length < current.length) {
                    await client.conversationalAi.agents.update(agentId, {
                        conversationConfig: {
                            ...agent.conversationConfig,
                            agent: {
                                ...agent.conversationConfig.agent,
                                prompt: {
                                    ...agent.conversationConfig.agent?.prompt,
                                    knowledgeBase,
                                },
                            },
                        },
                    });
                }
            } catch (agentError) {
                console.error(
                    "Error removing document from agent:",
                    agentError
                );
                // Continue with deletion even if agent update fails
            }
        }

        // Step 2: Delete the document from knowledge base
        await client.conversationalAi.knowledgeBase.documents.delete(
            documentId,
            {}
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting knowledge base document:", error);

        // Check if it's a "not found" error
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage?.includes("not found")) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete knowledge base document",
            },
            { status: 500 }
        );
    }
}
