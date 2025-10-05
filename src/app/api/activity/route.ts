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

        // Call the database function to record activity
        const { error: activityError } = await supabase.rpc(
            "record_daily_activity",
            {
                user_id: user.id,
            }
        );

        if (activityError) {
            console.error("Error recording activity:", activityError);
            return NextResponse.json(
                { error: "Failed to record activity" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in activity recording:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
