import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();
        const { data } = await supabase.auth.exchangeCodeForSession(code);

        // Check if this is a new user by checking if profile exists
        if (data.user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("first_name, last_name")
                .eq("id", data.user.id)
                .single();

            // If profile has no name, redirect to profile setup
            if (!profile || (!profile.first_name && !profile.last_name)) {
                return NextResponse.redirect(`${origin}/profile-setup`);
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/dashboard`);
}
