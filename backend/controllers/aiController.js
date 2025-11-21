import { GoogleGenerativeAI } from "@google/generative-ai";
import doctorModel from "../models/doctorModel.js";
import { mapSymptomsToSpecialty } from "../utils/symptomMapper.js";
import { 
    SAFETY_SYSTEM_PROMPT, 
    REPORT_DISCLAIMER, 
    CHAT_DISCLAIMER,
    isUnsafeRequest,
    getUnsafeRequestResponse 
} from "../utils/aiSafety.js";
import pdfParse from "pdf-parse";
import fs from "fs";

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
    console.error("WARNING: GEMINI_API_KEY is not set in environment variables");
}

const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;
// Use gemini-2.0-flash for free tier (fast and efficient)
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

/**
 * Main AI Assistant Handler
 * Handles user messages and provides safe medical assistance
 */
export const aiAssistant = async (req, res) => {
    try {
        if (!genAI || !model) {
            return res.json({ 
                success: false, 
                message: "AI service is not configured. Please contact administrator." 
            });
        }

        const { message, userId, context } = req.body;

        if (!message || !message.trim()) {
            return res.json({ success: false, message: "Message is required" });
        }

        // Check for unsafe requests
        if (isUnsafeRequest(message)) {
            return res.json({
                success: true,
                reply: getUnsafeRequestResponse(),
                doctorSuggestions: [],
                disclaimer: CHAT_DISCLAIMER
            });
        }

        // Build conversation context
        const conversationHistory = context?.history || [];
        const conversationContext = conversationHistory
            .slice(-5) // Last 5 messages for context
            .map(msg => `${msg.role}: ${msg.content}`)
            .join("\n");

        // Create prompt with safety rules
        const userPrompt = `User message: ${message}\n\n${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}Please provide a helpful response following all safety guidelines.`;

        // Get AI response
        const result = await model.generateContent([
            SAFETY_SYSTEM_PROMPT,
            userPrompt
        ]);

        const aiResponse = result.response.text();
        let doctorSuggestions = [];
        let timeSlots = [];

        // Check if user is asking about symptoms or looking for a doctor
        const lowerMessage = message.toLowerCase();
        const symptomKeywords = ["symptom", "pain", "ache", "feeling", "experiencing", "suffering", "problem", "issue"];
        const doctorKeywords = ["doctor", "specialist", "appointment", "book", "consult"];

        if (symptomKeywords.some(keyword => lowerMessage.includes(keyword)) || 
            doctorKeywords.some(keyword => lowerMessage.includes(keyword))) {
            
            // Extract specialty from symptoms
            const recommendedSpecialty = mapSymptomsToSpecialty(message);
            
            // Find matching doctors
            const doctors = await doctorModel.find({ 
                speciality: recommendedSpecialty,
                available: true 
            }).select(['-password', '-email', '-slots_booked']).limit(5);

            doctorSuggestions = doctors.map(doc => ({
                _id: doc._id,
                name: doc.name,
                speciality: doc.speciality,
                experience: doc.experience,
                fees: doc.fees,
                about: doc.about,
                image: doc.image,
                address: doc.address
            }));

            // If doctor selected, get time slots (mock for now - integrate with actual slot system)
            if (context?.selectedDoctorId) {
                // This would integrate with your slot booking system
                timeSlots = generateMockTimeSlots();
            }
        }

        res.json({
            success: true,
            reply: aiResponse,
            doctorSuggestions,
            timeSlots,
            disclaimer: CHAT_DISCLAIMER
        });

    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.json({ 
            success: false, 
            message: "Sorry, I'm having trouble processing your request. Please try again." 
        });
    }
};

/**
 * Analyze Medical Report (PDF or Image)
 */
export const analyzeReport = async (req, res) => {
    try {
        if (!genAI || !model) {
            return res.json({ 
                success: false, 
                message: "AI service is not configured. Please contact administrator." 
            });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        let analysis = "";
        let extractedText = "";

        // Handle PDF files
        if (req.file.mimetype === "application/pdf") {
            const pdfBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(pdfBuffer);
            extractedText = pdfData.text;

            // Analyze PDF text with Gemini
            const analysisPrompt = `Analyze this medical report and provide:
1. Key findings and values
2. Explanation of medical terms in simple language
3. General interpretation (NOT diagnosis)
4. What type of test/report this is

Medical Report Content:
${extractedText}

Remember: Provide educational information only, not diagnosis.`;

            const result = await model.generateContent([
                SAFETY_SYSTEM_PROMPT,
                analysisPrompt
            ]);

            analysis = result.response.text();
        } 
        // Handle images (Gemini can process images directly)
        else if (req.file.mimetype.startsWith("image/")) {
            // For images, send directly to Gemini Vision
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = imageData.toString("base64");

            const result = await model.generateContent([
                SAFETY_SYSTEM_PROMPT,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: req.file.mimetype
                    }
                },
                "Please analyze this medical report/image. Extract key findings, explain medical terms in simple language, and provide a summary. Remember: This is NOT a diagnosis - only an educational summary. Provide:\n1. Key findings and values\n2. Explanation of medical terms\n3. General interpretation (NOT diagnosis)\n4. What type of test/report this is"
            ]);

            analysis = result.response.text();
            extractedText = "Image analyzed directly by AI";
        } else {
            return res.json({ success: false, message: "Unsupported file type. Please upload PDF or image." });
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            summary: analysis,
            extractedText: extractedText.length > 500 ? extractedText.substring(0, 500) + "..." : extractedText,
            disclaimer: REPORT_DISCLAIMER
        });

    } catch (error) {
        console.error("Report Analysis Error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.json({ 
            success: false, 
            message: "Error analyzing report. Please ensure the file is readable and try again." 
        });
    }
};

/**
 * Summarize Chat History (for doctors)
 */
export const summarizeChatHistory = async (req, res) => {
    try {
        if (!genAI || !model) {
            return res.json({ 
                success: false, 
                message: "AI service is not configured. Please contact administrator." 
            });
        }

        const { chatHistory } = req.body;

        if (!chatHistory || !Array.isArray(chatHistory)) {
            return res.json({ success: false, message: "Invalid chat history" });
        }

        const chatText = chatHistory
            .map(msg => `${msg.role || 'User'}: ${msg.message || msg.content}`)
            .join("\n");

        const summaryPrompt = `Summarize this patient-doctor chat conversation. Extract:
1. Main symptoms discussed
2. Key questions asked
3. Important information shared
4. Recommended next steps (if any)

Chat History:
${chatText}

Provide a concise, professional summary.`;

        const result = await model.generateContent([
            SAFETY_SYSTEM_PROMPT,
            summaryPrompt
        ]);

        const summary = result.response.text();

        res.json({
            success: true,
            summary,
            disclaimer: "This is an AI-generated summary. Review carefully before making medical decisions."
        });

    } catch (error) {
        console.error("Chat Summary Error:", error);
        res.json({ 
            success: false, 
            message: "Error summarizing chat history." 
        });
    }
};

/**
 * Generate mock time slots (replace with actual slot system)
 */
function generateMockTimeSlots() {
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        
        const times = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
        
        times.forEach(time => {
            slots.push({
                date: date.toISOString().split('T')[0],
                time: time,
                available: Math.random() > 0.3 // 70% availability
            });
        });
    }
    
    return slots;
}

