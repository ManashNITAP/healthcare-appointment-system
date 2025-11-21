// Test with v1 API endpoint
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

console.log("✅ API Key found");
console.log("🔄 Testing with v1 API endpoint...\n");

try {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Say hello in one word"
                    }]
                }]
            })
        }
    );

    const data = await response.json();
    
    if (response.ok && data.candidates) {
        console.log("✅ SUCCESS! API is working!");
        console.log("Response:", data.candidates[0].content.parts[0].text);
        console.log("\n📝 The API key is valid. The issue might be with the SDK model name.");
    } else {
        console.log("❌ API Error:", JSON.stringify(data, null, 2));
        
        if (data.error) {
            console.log("\n💡 Suggestions:");
            if (data.error.message.includes("API key")) {
                console.log("- Check if API key is correct");
                console.log("- Make sure there are no extra spaces");
            }
            if (data.error.message.includes("quota") || data.error.message.includes("limit")) {
                console.log("- You may have exceeded free tier limits");
                console.log("- Check usage at: https://aistudio.google.com/app/apikey");
            }
            if (data.error.message.includes("enable")) {
                console.log("- Enable Generative AI API in Google Cloud Console");
            }
        }
    }
} catch (error) {
    console.error("❌ Network Error:", error.message);
}

