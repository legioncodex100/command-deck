import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/services/gemini";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, systemPrompt, model, jsonMode } = body;

        if (!prompt || !systemPrompt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await generateText(prompt, systemPrompt, model, jsonMode);
        return NextResponse.json({ result: response });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
