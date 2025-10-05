import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

// This endpoint is called by the pg_cron job
// It doesn't require user authentication since it's triggered by the database
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, phone_number } = body;

        if (!phone_number) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Initialize ElevenLabs client
        const client = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        });

        // Make the outbound call
        const response = await client.conversationalAi.twilio.outboundCall({
            agentId: "agent_6201k6shnp39eheavzgd5afg85pr",
            agentPhoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID || "",
            toNumber: phone_number,
        });

        console.log(
            `Scheduled call initiated for user ${user_id} to ${phone_number}`
        );

        return NextResponse.json({
            success: true,
            message: "Scheduled call initiated",
            user_id,
            data: response,
        });
    } catch (error) {
        console.error("Error making scheduled call:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to initiate scheduled call";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
