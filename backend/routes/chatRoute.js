import express from 'express';
import { getChatMessages, endChat, uploadFile, deleteChat } from '../controllers/chatController.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';

const chatRouter = express.Router();

// Get chat messages - supports both user and doctor tokens
chatRouter.get("/messages/:appointmentId", async (req, res, next) => {
    // Try user token first
    if (req.headers.token) {
        return authUser(req, res, next);
    }
    // Then try doctor token
    if (req.headers.dtoken) {
        return authDoctor(req, res, next);
    }
    return res.json({ success: false, message: 'Not Authorized Login Again' });
}, getChatMessages);

// End chat (doctor only)
chatRouter.post("/end", authDoctor, endChat);

// Upload file - supports both user and doctor tokens
chatRouter.post("/upload-file", async (req, res, next) => {
    // Try user token first
    if (req.headers.token) {
        return authUser(req, res, next);
    }
    // Then try doctor token
    if (req.headers.dtoken) {
        return authDoctor(req, res, next);
    }
    return res.json({ success: false, message: 'Not Authorized Login Again' });
}, upload.single('file'), uploadFile);

// Delete chat (user only)
chatRouter.post("/delete", authUser, deleteChat);

export default chatRouter;

