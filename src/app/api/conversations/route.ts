import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        });

        const response = await client.conversationalAi.conversations.list({});

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversations" },
            { status: 500 }
        );
    }
}
