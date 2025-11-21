import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import chatMessageModel from "../models/chatMessageModel.js";

// Map to store active users: { userId → socketId }
const activeUsers = new Map();

// Export io instance for use in controllers
let ioInstance = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Configure this properly for production
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            // Check for token in auth, headers, or query (for compatibility)
            const token = socket.handshake.auth.token 
                || socket.handshake.headers.token 
                || socket.handshake.headers.dtoken
                || socket.handshake.query?.token;
            
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Store user's socket connection
        activeUsers.set(socket.userId, socket.id);

        // Handle joining a chat room
        socket.on("join_chat", async ({ chatId }) => {
            try {
                // Verify appointment exists and user belongs to it
                const appointment = await appointmentModel.findById(chatId);
                
                if (!appointment) {
                    socket.emit("error", { message: "Appointment not found" });
                    return;
                }

                // Verify user belongs to this appointment
                if (appointment.userId !== socket.userId && appointment.docId !== socket.userId) {
                    socket.emit("error", { message: "Unauthorized access" });
                    return;
                }

                // Allow joining even if chat is closed (for viewing purposes)
                // Users can view closed chats, but cannot send messages (handled in send_message)
                socket.join(chatId);
                socket.emit("joined_chat", { chatId, chatClosed: appointment.chatClosed || false });

                console.log(`User ${socket.userId} joined chat ${chatId}${appointment.chatClosed ? ' (closed)' : ''}`);
            } catch (error) {
                console.error("Error joining chat:", error);
                socket.emit("error", { message: error.message });
            }
        });

        // Handle sending messages
        socket.on("send_message", async ({ chatId, message, timestamp }) => {
            try {
                // Verify appointment exists and user belongs to it
                const appointment = await appointmentModel.findById(chatId);
                
                if (!appointment) {
                    socket.emit("error", { message: "Appointment not found" });
                    return;
                }

                // Check if chat is closed
                if (appointment.chatClosed) {
                    socket.emit("error", { message: "Chat closed permanently" });
                    return;
                }

                // Verify user belongs to this appointment
                if (appointment.userId !== socket.userId && appointment.docId !== socket.userId) {
                    socket.emit("error", { message: "Unauthorized access" });
                    return;
                }

                // Validate message has content
                if (!message || !message.trim()) {
                    socket.emit("error", { message: "Message cannot be empty" });
                    return;
                }

                // Create message object
                const messageData = {
                    chatId,
                    senderId: socket.userId,
                    message: message.trim(),
                    timestamp: timestamp || new Date()
                };

                // Save message to database
                const savedMessage = await chatMessageModel.create(messageData);

                // Emit message to all users in the room
                io.to(chatId).emit("receive_message", {
                    _id: savedMessage._id,
                    chatId: savedMessage.chatId,
                    senderId: savedMessage.senderId,
                    message: savedMessage.message,
                    fileUrl: savedMessage.fileUrl || null,
                    fileName: savedMessage.fileName || null,
                    fileType: savedMessage.fileType || null,
                    timestamp: savedMessage.timestamp
                });

                console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: error.message });
            }
        });

        // Handle typing indicator
        socket.on("typing", ({ chatId }) => {
            socket.to(chatId).emit("user_typing", { userId: socket.userId });
        });

        // Handle stop typing indicator
        socket.on("stop_typing", ({ chatId }) => {
            socket.to(chatId).emit("user_stopped_typing", { userId: socket.userId });
        });

        // Handle chat closed event (emitted by doctor)
        socket.on("chat_closed", ({ chatId }) => {
            io.to(chatId).emit("chat_closed", { chatId });
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
            activeUsers.delete(socket.userId);
        });
    });

    ioInstance = io;
    return io;
};

// Export function to get io instance
export const getIO = () => ioInstance;

