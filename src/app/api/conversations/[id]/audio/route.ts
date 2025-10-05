import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        });

        const audioStream =
            await client.conversationalAi.conversations.audio.get(id);

        // Convert ReadableStream to buffer
        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": `inline; filename="conversation-${id}.mp3"`,
            },
        });
    } catch (error) {
        console.error("Error fetching audio:", error);
        return NextResponse.json(
            { error: "Failed to fetch audio" },
            { status: 500 }
        );
    }
}
