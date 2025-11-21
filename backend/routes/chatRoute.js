import express from 'express';
import { getChatMessages, endChat, uploadFile, deleteChat } from '../controllers/chatController.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import authUserOrDoctor from '../middleware/authUserOrDoctor.js';
import upload from '../middleware/multer.js';

const chatRouter = express.Router();

// Get chat messages - supports both user and doctor tokens
chatRouter.get("/messages/:appointmentId", authUserOrDoctor, getChatMessages);

// End chat (doctor only)
chatRouter.post("/end", authDoctor, endChat);

// Upload file - supports both user and doctor tokens
chatRouter.post("/upload-file", authUserOrDoctor, upload.single('file'), uploadFile);

// Delete chat (user only)
chatRouter.post("/delete", authUser, deleteChat);

export default chatRouter;

