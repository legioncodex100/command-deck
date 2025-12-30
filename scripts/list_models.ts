
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    if (!apiKey) {
        console.error("No API Key found in .env.local");
        return;
    }
    console.log(`API Key Length: ${apiKey.length}`);
    if (apiKey.trim() !== apiKey) console.warn("WARNING: API Key has leading/trailing whitespace!");
    console.log("Using API Key ending in:", apiKey.slice(-4));
    console.log("Fetching available models...");

    // We can't access listModels directly via the high-level genAI object easily in some versions,
    // but we can try to just run a generation test on a few likely candidates.

    // Actually, newer SDKs don't expose listModels on the main class easily without accessing the underlying client.
    // So let's just try to generate content with a few variations and see which one hits.

    const candidates = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.0-pro"
    ];

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName.padEnd(25)}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello?");
            const response = await result.response;
            console.log("✅ SUCCESS");
        } catch (e: any) {
            console.log("❌ FAILED: " + (e.message?.split('[')[0] || e.message));
        }
    }
}

listModels();
