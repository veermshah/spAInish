import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const client = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        });

        const conversation = await client.conversationalAi.conversations.get(
            params.id
        );

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversation" },
            { status: 500 }
        );
    }
}
