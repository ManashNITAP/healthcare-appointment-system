// List available models for this API key
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

console.log("✅ API Key found");
console.log("🔄 Fetching available models...\n");

try {
    // Try v1beta endpoint
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );

    const data = await response.json();
    
    if (response.ok && data.models) {
        console.log("✅ Available models:");
        console.log("=".repeat(50));
        data.models.forEach(model => {
            console.log(`📌 ${model.name}`);
            if (model.supportedGenerationMethods) {
                console.log(`   Methods: ${model.supportedGenerationMethods.join(", ")}`);
            }
        });
        console.log("=".repeat(50));
        
        // Find models that support generateContent
        const generateContentModels = data.models.filter(m => 
            m.supportedGenerationMethods?.includes('generateContent')
        );
        
        if (generateContentModels.length > 0) {
            console.log("\n✅ Models that support generateContent:");
            generateContentModels.forEach(model => {
                const modelName = model.name.replace('models/', '');
                console.log(`   - ${modelName}`);
            });
            console.log(`\n💡 Try using one of these model names in your code.`);
        }
    } else {
        console.log("❌ Error:", JSON.stringify(data, null, 2));
        
        if (data.error) {
            console.log("\n💡 This might mean:");
            console.log("1. API key is invalid or expired");
            console.log("2. Generative AI API is not enabled");
            console.log("3. API key doesn't have proper permissions");
            console.log("\n🔗 Get a new API key: https://aistudio.google.com/app/apikey");
        }
    }
} catch (error) {
    console.error("❌ Network Error:", error.message);
}

