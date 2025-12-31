
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("Checking Environment Variables:");
const key = process.env.GEMINI_API_KEY;
if (key) {
    console.log(`GEMINI_API_KEY Found. Length: ${key.length}`);
    console.log(`First 4 chars: ${key.substring(0, 4)}...`);
} else {
    console.log("GEMINI_API_KEY is MISSING or UNDEFINED.");
}
