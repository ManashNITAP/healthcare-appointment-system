import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Chat = ({ appointmentId, userType, currentUserId, userName, otherUserName, onClose, onChatClosed }) => {
    const { backendUrl, token } = useContext(AppContext);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatClosed, setChatClosed] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize socket connection
    useEffect(() => {
        if (!token || !appointmentId) return;

        // Create socket connection
        const newSocket = io(backendUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected');
            // Join the chat room
            newSocket.emit('join_chat', { chatId: appointmentId });
        });

        newSocket.on('joined_chat', ({ chatId, chatClosed }) => {
            console.log(`Joined chat: ${chatId}`);
            if (chatClosed) {
                setChatClosed(true);
            }
            // Fetch old messages
            fetchMessages();
        });

        newSocket.on('error', ({ message }) => {
            console.error('Socket error:', message);
            toast.error(message);
            if (message.includes('Chat closed')) {
                setChatClosed(true);
                if (onChatClosed) onChatClosed();
            }
        });

        // Message events
        newSocket.on('receive_message', (messageData) => {
            setMessages(prev => [...prev, messageData]);
        });

        // Typing events
        newSocket.on('user_typing', ({ userId }) => {
            setIsTyping(true);
            setTypingUser(userId);
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Hide typing indicator after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                setTypingUser(null);
            }, 3000);
        });

        newSocket.on('user_stopped_typing', ({ userId }) => {
            setIsTyping(false);
            setTypingUser(null);
        });

        // Chat closed event
        newSocket.on('chat_closed', ({ chatId }) => {
            setChatClosed(true);
            toast.info('Chat closed by doctor');
            if (onChatClosed) onChatClosed();
        });

        // Cleanup on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            newSocket.disconnect();
        };
    }, [token, appointmentId]);

    // Fetch old messages from database
    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/chat/messages/${appointmentId}`,
                { headers: { token } }
            );

            if (data.success) {
                setMessages(data.messages || []);
                if (data.chatClosed) {
                    setChatClosed(true);
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    // Send message
    const sendMessage = (e) => {
        e.preventDefault();
        
        if ((!newMessage.trim() && !selectedFile) || chatClosed || !socket) return;

        const messageData = {
            chatId: appointmentId,
            message: newMessage.trim(),
            timestamp: new Date()
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    // Upload file
    const uploadFile = async () => {
        if (!selectedFile || chatClosed) return;

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('appointmentId', appointmentId);
            formData.append('message', newMessage);

            const { data } = await axios.post(
                `${backendUrl}/api/chat/upload-file`,
                formData,
                {
                    headers: {
                        token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                setNewMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                toast.success('File sent successfully');
            } else {
                toast.error(data.message || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(error?.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    // Handle typing indicator
    const handleTyping = () => {
        if (!socket || chatClosed) return;
        
        socket.emit('typing', { chatId: appointmentId });
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { chatId: appointmentId });
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                {/* Chat Header */}
                <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Chat with {otherUserName}</h3>
                        {chatClosed && (
                            <p className="text-sm text-red-200">Chat closed by doctor - Read only</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwnMessage = msg.senderId === currentUserId;
                            return (
                                <div
                                    key={index}
                                    className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            isOwnMessage
                                                ? 'bg-primary text-white'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                        }`}
                                    >
                                        {/* File display */}
                                        {msg.fileUrl && (
                                            <div className="mb-2">
                                                {msg.fileType === 'image' ? (
                                                    <img
                                                        src={msg.fileUrl}
                                                        alt={msg.fileName || 'Image'}
                                                        className="max-w-full rounded-lg cursor-pointer"
                                                        onClick={() => window.open(msg.fileUrl, '_blank')}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs truncate">{msg.fileName || 'File'}</p>
                                                            <a
                                                                href={msg.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs underline"
                                                            >
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Message text */}
                                        {msg.message && (
                                            <p className="text-sm">{msg.message}</p>
                                        )}
                                        <p className={`text-xs mt-1 ${
                                            isOwnMessage
                                                ? 'text-white opacity-75'
                                                : 'text-gray-500'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {/* Typing Indicator */}
                    {isTyping && typingUser && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                                <p className="text-sm text-gray-500 italic">
                                    {otherUserName} is typing...
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t">
                    {chatClosed ? (
                        <div className="text-center text-gray-500 py-2">
                            Chat has been closed. You cannot send messages.
                        </div>
                    ) : (
                        <>
                            {/* Selected file preview */}
                            {selectedFile && (
                                <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm truncate">{selectedFile.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-input"
                                    disabled={chatClosed || uploadingFile}
                                />
                                <label
                                    htmlFor="file-input"
                                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center"
                                    title="Attach file"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 00-2.828-2.828L9 10.172 7.586 8.586a4 4 0 115.657 5.657L15.172 7z" />
                                    </svg>
                                </label>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={chatClosed || uploadingFile}
                                />
                                {selectedFile ? (
                                    <button
                                        type="button"
                                        onClick={uploadFile}
                                        disabled={uploadingFile || chatClosed}
                                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingFile ? 'Uploading...' : 'Send File'}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || chatClosed}
                                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;

