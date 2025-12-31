import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModelsRaw() {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Fetching models for key starting with:", key?.substring(0, 5));

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`); // e.g. "models/gemini-pro"
                }
            });
        } else {
            console.log("Unexpected response:", data);
        }
    } catch (e: any) {
        console.error("Fetch failed:", e.message);
    }
}

listModelsRaw();
