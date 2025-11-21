// Direct API test to find working model
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

console.log("✅ API Key found");

// Try different model names
const modelsToTry = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "models/gemini-pro",
    "models/gemini-1.5-pro"
];

for (const modelName of modelsToTry) {
    try {
        console.log(`\n🔄 Testing model: ${modelName}`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Say hello"
                        }]
                    }]
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS! Model "${modelName}" works!`);
            console.log("Response:", data.candidates[0].content.parts[0].text);
            console.log(`\n📝 Use this model name in your code: "${modelName}"`);
            process.exit(0);
        } else {
            const error = await response.json();
            console.log(`❌ Failed: ${error.error?.message || response.statusText}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

console.log("\n❌ None of the models worked. Please check:");
console.log("1. API key is valid");
console.log("2. Generative AI API is enabled in Google Cloud Console");
console.log("3. Your project has access to Gemini API");

