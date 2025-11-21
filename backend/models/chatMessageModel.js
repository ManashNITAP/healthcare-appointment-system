import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    chatId: { type: String, required: true, index: true }, // same as appointmentId
    senderId: { type: String, required: true },
    message: { type: String, default: "" }, // Optional - can send file without message
    fileUrl: { type: String, default: null }, // URL of uploaded file
    fileName: { type: String, default: null }, // Original file name
    fileType: { type: String, default: null }, // File type (image, document, etc.)
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const chatMessageModel = mongoose.models.chatmessage || mongoose.model("chatmessage", chatMessageSchema);
export default chatMessageModel;

