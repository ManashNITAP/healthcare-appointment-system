import express from 'express';
import { aiAssistant, analyzeReport, summarizeChatHistory } from '../controllers/aiController.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';

const aiRouter = express.Router();

// Main AI assistant endpoint (user)
aiRouter.post("/assistant", authUser, aiAssistant);

// Analyze medical report (supports both user and doctor)
aiRouter.post("/analyze-report", async (req, res, next) => {
    // Try user token first
    if (req.headers.token) {
        return authUser(req, res, next);
    }
    // Then try doctor token
    if (req.headers.dtoken) {
        return authDoctor(req, res, next);
    }
    return res.json({ success: false, message: 'Not Authorized Login Again' });
}, upload.single('file'), analyzeReport);

// Summarize chat history (doctor)
aiRouter.post("/summarize-chat", authDoctor, summarizeChatHistory);

export default aiRouter;

