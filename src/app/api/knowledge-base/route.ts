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
            const document = await client.conversationalAi.knowledgeBase.documents.get(documentId, {});
            return NextResponse.json(document);
        }

        // Otherwise, list all documents
        const response = await client.conversationalAi.knowledgeBase.list({});
        
        return NextResponse.json({
            documents: response.documents || [],
            next_cursor: response.nextCursor || null,
            has_more: response.hasMore || false,
        });
    } catch (error: any) {
        console.error("Error fetching knowledge base:", error);
        
        // Check if it's a "not found" error
        if (error.message?.includes("not found")) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: error.message || "Failed to fetch knowledge base documents" },
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

        const response = await client.conversationalAi.knowledgeBase.documents.createFromText({
            text: text.trim(),
        });

        return NextResponse.json({
            id: response.id,
            name: response.name,
        });
    } catch (error: any) {
        console.error("Error creating knowledge base document:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create knowledge base document" },
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

        await client.conversationalAi.knowledgeBase.documents.delete(documentId, {});

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting knowledge base document:", error);
        
        // Check if it's a "not found" error
        if (error.message?.includes("not found")) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to delete knowledge base document" },
            { status: 500 }
        );
    }
}
