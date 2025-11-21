// List available Gemini models
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    console.log("🔄 Fetching available models...");
    const models = await genAI.listModels();
    console.log("✅ Available models:", models);
} catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n📝 This might mean:");
    console.log("1. Your API key is invalid");
    console.log("2. The Generative AI API is not enabled for your Google Cloud project");
    console.log("3. You need to get a new API key from Google AI Studio");
    console.log("\n🔗 Get a free API key: https://aistudio.google.com/app/apikey");
}

