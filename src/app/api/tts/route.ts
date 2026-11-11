import { NextResponse } from "next/server";

const VOICE_ID = "kcQkGnn0HAT2JRDQ4Ljp";
const MODEL_ID = "eleven_monolingual_v1";
// Lessons are a few paragraphs; cap input so the endpoint can't be used to burn credits.
const MAX_CHARS = 6000;

export async function POST(request: Request) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Text-to-speech is not configured" },
            { status: 500 }
        );
    }

    let text: unknown;
    try {
        ({ text } = await request.json());
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    if (text.length > MAX_CHARS) {
        return NextResponse.json(
            { error: `Text must be at most ${MAX_CHARS} characters` },
            { status: 413 }
        );
    }

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
        {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, model_id: MODEL_ID }),
        }
    );

    if (!response.ok) {
        console.error("ElevenLabs TTS failed:", response.status, await response.text());
        return NextResponse.json(
            { error: "Failed to generate speech" },
            { status: 502 }
        );
    }

    return NextResponse.json(await response.json());
}
