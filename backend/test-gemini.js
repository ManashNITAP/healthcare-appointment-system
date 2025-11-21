// Test script to verify Gemini API key
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in environment variables");
    process.exit(1);
}

console.log("✅ API Key found:", apiKey.substring(0, 20) + "...");

try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log("🔄 Testing API connection...");
    
    const result = await model.generateContent("Say 'Hello' if you can hear me");
    const response = result.response.text();
    
    console.log("✅ API is working!");
    console.log("Response:", response);
} catch (error) {
    console.error("❌ API Error:", error.message);
    
    if (error.message.includes("API_KEY_INVALID") || error.message.includes("invalid")) {
        console.log("\n📝 Your API key appears to be invalid.");
        console.log("Please get a free API key from: https://aistudio.google.com/app/apikey");
    } else if (error.message.includes("quota") || error.message.includes("limit")) {
        console.log("\n⚠️  You may have exceeded your free tier quota.");
        console.log("Check your usage at: https://aistudio.google.com/app/apikey");
    } else {
        console.log("\n❌ Error details:", error);
    }
    
    process.exit(1);
}

