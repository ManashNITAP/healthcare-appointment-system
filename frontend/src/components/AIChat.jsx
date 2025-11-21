import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const AIChat = ({ onClose }) => {
    const navigate = useNavigate();
    const { backendUrl, token } = useContext(AppContext);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your AI medical assistant. I can help you:\n\n• Find the right doctor based on your symptoms\n• Answer general health questions\n• Explain medical terms\n• Analyze medical reports\n\n⚠️ Please note: I cannot diagnose or prescribe. I'm here to guide you to appropriate medical care.\n\nHow can I help you today?"
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [doctorSuggestions, setDoctorSuggestions] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim() && !selectedFile) return;
        if (loading) return;

        const userMessage = inputMessage.trim();
        if (userMessage) {
            setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        }

        setInputMessage('');
        setLoading(true);

        try {
            // If file is selected, analyze report
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const { data } = await axios.post(
                    `${backendUrl}/api/ai/analyze-report`,
                    formData,
                    {
                        headers: {
                            token
                            // Don't set Content-Type manually - axios will set it with boundary
                        }
                    }
                );

                if (data.success) {
                    setMessages(prev => [...prev, 
                        { role: 'assistant', content: data.summary, disclaimer: data.disclaimer }
                    ]);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } else {
                    toast.error(data.message || 'Failed to analyze report');
                }
            } else {
                // Regular chat message
                const conversationHistory = messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

                const { data } = await axios.post(
                    `${backendUrl}/api/ai/assistant`,
                    {
                        message: userMessage,
                        userId: 'user', // Will be set by authUser middleware
                        context: {
                            history: conversationHistory
                        }
                    },
                    { headers: { token } }
                );

                if (data.success) {
                    setMessages(prev => [...prev, 
                        { 
                            role: 'assistant', 
                            content: data.reply,
                            disclaimer: data.disclaimer,
                            doctorSuggestions: data.doctorSuggestions || []
                        }
                    ]);

                    if (data.doctorSuggestions && data.doctorSuggestions.length > 0) {
                        setDoctorSuggestions(data.doctorSuggestions);
                    }
                } else {
                    toast.error(data.message || 'Failed to get AI response');
                }
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            toast.error(error?.response?.data?.message || 'Something went wrong');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I'm having trouble processing your request. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            // Check file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload PDF or image files only');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleBookAppointment = (doctorId) => {
        // Close the chat modal
        onClose();
        // Navigate to appointment booking page using React Router
        navigate(`/appointment/${doctorId}`);
        // Scroll to top
        window.scrollTo(0, 0);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">AI Medical Assistant</h3>
                        <p className="text-xs text-white/80">I can help you find the right doctor and answer health questions</p>
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
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                                    msg.role === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                            >
                                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                
                                {/* Disclaimer */}
                                {msg.disclaimer && (
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        {msg.disclaimer}
                                    </div>
                                )}

                                {/* Doctor Suggestions */}
                                {msg.doctorSuggestions && msg.doctorSuggestions.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <p className="font-semibold text-sm mb-2">Recommended Doctors:</p>
                                        {msg.doctorSuggestions.map((doctor, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                <div className="flex items-start gap-3">
                                                    <img 
                                                        src={doctor.image} 
                                                        alt={doctor.name}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm">{doctor.name}</h4>
                                                        <p className="text-xs text-gray-600">{doctor.speciality}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{doctor.experience} experience</p>
                                                        <p className="text-xs font-medium mt-1">Fee: ₹{doctor.fees}</p>
                                                        <button
                                                            onClick={() => handleBookAppointment(doctor._id)}
                                                            className="mt-2 text-xs bg-primary text-white px-4 py-1 rounded hover:bg-primary-dark"
                                                        >
                                                            Book Appointment
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t">
                    {/* File Preview */}
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
                            id="ai-file-input"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={loading}
                        />
                        <label
                            htmlFor="ai-file-input"
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center"
                            title="Upload medical report (PDF/Image)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 00-2.828-2.828L9 10.172 7.586 8.586a4 4 0 115.657 5.657L15.172 7z" />
                            </svg>
                        </label>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me about symptoms, find a doctor, or upload a medical report..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={(!inputMessage.trim() && !selectedFile) || loading}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIChat;

