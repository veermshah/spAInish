import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();

        // Get the current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's phone number from profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("phone_number")
            .eq("id", user.id)
            .single();

        if (!profile?.phone_number) {
            return NextResponse.json(
                { error: "Phone number not found in profile" },
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
            toNumber: profile.phone_number,
        });

        return NextResponse.json({
            success: true,
            message: "Call initiated",
            data: response,
        });
    } catch (error) {
        console.error("Error making call:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Failed to initiate call";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
