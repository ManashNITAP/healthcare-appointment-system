/**
 * AI Safety Rules and Prompts
 * Ensures AI assistant follows strict medical safety guidelines
 */

export const SAFETY_SYSTEM_PROMPT = `You are a helpful medical assistant AI integrated into a healthcare platform. Your role is to assist users in finding the right doctor and provide general health information.

CRITICAL SAFETY RULES - YOU MUST FOLLOW THESE STRICTLY:

1. NEVER diagnose diseases or medical conditions
2. NEVER prescribe medications or treatments
3. NEVER provide specific medical advice for individual cases
4. NEVER interpret medical reports as definitive diagnoses
5. NEVER recommend specific dosages or treatment plans

WHAT YOU CAN DO:
- Provide general health information and education
- Explain medical terms in simple language
- Help users understand their symptoms
- Suggest appropriate medical specialties based on symptoms
- Guide users to book appointments with doctors
- Summarize medical reports with clear disclaimers
- Answer general health questions (e.g., "What is diabetes?")

RESPONSE FORMAT:
- Always be polite and professional
- When asked about diagnosis, say: "I'm not allowed to give medical diagnosis. Please consult a doctor for proper evaluation."
- When asked about prescriptions, say: "I cannot prescribe medications. Please consult a qualified doctor."
- Always include disclaimers when discussing health information
- When suggesting doctors, provide clear reasons based on symptoms

Remember: Your goal is to guide users to appropriate medical care, not to replace it.`;

export const REPORT_DISCLAIMER = `⚠️ IMPORTANT DISCLAIMER:
This is an AI-generated summary for educational purposes only. It is NOT a medical diagnosis or professional interpretation. The information provided is based on general medical knowledge and may not be accurate for your specific situation.

Please consult a qualified healthcare professional for:
- Accurate diagnosis
- Proper interpretation of your reports
- Treatment recommendations
- Medical advice specific to your condition

Never make medical decisions based solely on AI-generated information.`;

export const CHAT_DISCLAIMER = `⚠️ DISCLAIMER:
This AI assistant provides general health information only. It does not diagnose, treat, or prescribe. Always consult a qualified doctor for medical concerns.`;

/**
 * Check if user message requests diagnosis or prescription
 * @param {string} message - User message
 * @returns {boolean} - True if message requests diagnosis/prescription
 */
export const isUnsafeRequest = (message) => {
    const lowerMessage = message.toLowerCase();
    const unsafePatterns = [
        "diagnose",
        "diagnosis",
        "what do i have",
        "what's wrong with me",
        "prescribe",
        "prescription",
        "give me medicine",
        "what medicine",
        "treatment for",
        "cure for",
        "how to treat",
        "should i take",
        "is this serious",
        "do i have",
        "am i sick"
    ];
    
    return unsafePatterns.some(pattern => lowerMessage.includes(pattern));
};

/**
 * Generate safe response for unsafe requests
 * @returns {string} - Safe response message
 */
export const getUnsafeRequestResponse = () => {
    return "I understand you're looking for medical guidance, but I'm not allowed to provide medical diagnoses or prescribe treatments. For proper evaluation and care, please consult a qualified doctor. I can help you find the right specialist based on your symptoms or answer general health questions.";
};

