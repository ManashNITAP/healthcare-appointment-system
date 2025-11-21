import appointmentModel from "../models/appointmentModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import { getIO } from "../sockets/socketServer.js";
import { v2 as cloudinary } from "cloudinary";

// API to get chat messages for an appointment
export const getChatMessages = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        // Get userId from req object (set by auth middleware) or from body as fallback
        const userId = req.userId || req.docId || req.body.userId || req.body.docId;

        // Verify user belongs to this appointment
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId !== userId && appointment.docId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Fetch messages
        const messages = await chatMessageModel
            .find({ chatId: appointmentId })
            .sort({ timestamp: 1 });

        res.json({ 
            success: true, 
            messages,
            chatClosed: appointment.chatClosed || false
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to end chat (doctor only)
export const endChat = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const { docId } = req.body; // from authDoctor middleware

        // Verify appointment exists and belongs to this doctor
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointment.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Mark chat as closed
        await appointmentModel.findByIdAndUpdate(appointmentId, { chatClosed: true });

        // Emit chat_closed event to all users in the room
        const io = getIO();
        if (io) {
            io.to(appointmentId).emit("chat_closed", { chatId: appointmentId });
        }

        res.json({ success: true, message: "Chat closed successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to upload file and send as message
export const uploadFile = async (req, res) => {
    try {
        const { appointmentId, message } = req.body;
        // Get userId from req object (set by auth middleware) or from body as fallback
        const userId = req.userId || req.docId || req.body.userId || req.body.docId;

        // Verify appointment exists and user belongs to it
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId !== userId && appointment.docId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Check if chat is closed
        if (appointment.chatClosed) {
            return res.json({ success: false, message: "Chat closed permanently" });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "chat_files",
            resource_type: "auto"
        });

        // Determine file type
        let fileType = "document";
        if (result.resource_type === "image") {
            fileType = "image";
        } else if (result.resource_type === "video") {
            fileType = "video";
        }

        // Create message with file
        const messageData = {
            chatId: appointmentId,
            senderId: userId,
            message: message || "",
            fileUrl: result.secure_url,
            fileName: req.file.originalname,
            fileType: fileType,
            timestamp: new Date()
        };

        const savedMessage = await chatMessageModel.create(messageData);

        // Emit message via socket
        const io = getIO();
        if (io) {
            io.to(appointmentId).emit("receive_message", {
                _id: savedMessage._id,
                chatId: savedMessage.chatId,
                senderId: savedMessage.senderId,
                message: savedMessage.message,
                fileUrl: savedMessage.fileUrl,
                fileName: savedMessage.fileName,
                fileType: savedMessage.fileType,
                timestamp: savedMessage.timestamp
            });
        }

        res.json({ 
            success: true, 
            message: "File uploaded successfully",
            messageData: savedMessage
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to delete chat (user only - deletes all messages and appointment)
export const deleteChat = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const { userId } = req.body; // from authUser middleware

        // Verify appointment exists and belongs to this user
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Verify chat is closed (only closed chats can be deleted)
        if (!appointment.chatClosed) {
            return res.json({ success: false, message: "Only closed chats can be deleted" });
        }

        // Delete all chat messages for this appointment
        await chatMessageModel.deleteMany({ chatId: appointmentId });

        // Delete the appointment entirely
        await appointmentModel.findByIdAndDelete(appointmentId);

        res.json({ success: true, message: "Chat deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

