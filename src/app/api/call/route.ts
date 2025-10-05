import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

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
    } catch (error: any) {
        console.error("Error making call:", error);
        return NextResponse.json(
            { error: error.message || "Failed to initiate call" },
            { status: 500 }
        );
    }
}
