import React, { useState, useRef, useContext } from 'react';
import { DoctorContext } from '../context/DoctorContext';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorTools = ({ onClose }) => {
    const { backendUrl, dToken } = useContext(DoctorContext);
    const { backendUrl: appBackendUrl } = useContext(AppContext);
    const backendUrlFinal = backendUrl || appBackendUrl;
    const token = dToken;

    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'report'
    const [chatHistory, setChatHistory] = useState('');
    const [chatSummary, setChatSummary] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [reportSummary, setReportSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const chatInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload PDF or image files only');
                return;
            }
            setSelectedFile(file);
        }
    };

    const summarizeChat = async () => {
        if (!chatHistory.trim()) {
            toast.error('Please paste chat history');
            return;
        }

        setLoading(true);
        try {
            // Parse chat history (assuming format: User: message\nDoctor: response\n)
            const lines = chatHistory.split('\n').filter(line => line.trim());
            const parsedHistory = lines.map(line => {
                if (line.startsWith('User:') || line.startsWith('Patient:')) {
                    return { role: 'user', message: line.replace(/^(User|Patient):\s*/, '') };
                } else if (line.startsWith('Doctor:') || line.startsWith('Dr:')) {
                    return { role: 'doctor', message: line.replace(/^(Doctor|Dr):\s*/, '') };
                }
                return { role: 'user', message: line };
            });

            const { data } = await axios.post(
                `${backendUrlFinal}/api/ai/summarize-chat`,
                { chatHistory: parsedHistory },
                { headers: { dToken: token } }
            );

            if (data.success) {
                setChatSummary(data.summary);
            } else {
                toast.error(data.message || 'Failed to summarize chat');
            }
        } catch (error) {
            console.error('Chat Summary Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to summarize chat');
        } finally {
            setLoading(false);
        }
    };

    const analyzeReport = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const { data } = await axios.post(
                `${backendUrlFinal}/api/ai/analyze-report`,
                formData,
                {
                    headers: {
                        dToken: token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                setReportSummary(data.summary);
            } else {
                toast.error(data.message || 'Failed to analyze report');
            }
        } catch (error) {
            console.error('Report Analysis Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to analyze report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">AI Doctor Tools</h3>
                        <p className="text-xs text-white/80">Summarize chats and analyze reports</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 px-4 py-3 font-medium ${
                            activeTab === 'chat'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Summarize Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`flex-1 px-4 py-3 font-medium ${
                            activeTab === 'report'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Analyze Report
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'chat' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Paste Chat History
                                </label>
                                <textarea
                                    ref={chatInputRef}
                                    value={chatHistory}
                                    onChange={(e) => setChatHistory(e.target.value)}
                                    placeholder="Paste chat history here. Format: User: message&#10;Doctor: response"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-48 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: User: message (new line) Doctor: response
                                </p>
                            </div>

                            <button
                                onClick={summarizeChat}
                                disabled={!chatHistory.trim() || loading}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Summarizing...' : 'Summarize Chat'}
                            </button>

                            {chatSummary && (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold mb-2">Summary:</h4>
                                    <div className="whitespace-pre-wrap text-sm text-gray-700">{chatSummary}</div>
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        ⚠️ This is an AI-generated summary. Review carefully before making medical decisions.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Medical Report
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: PDF, JPG, PNG (Max 10MB)
                                </p>
                            </div>

                            {selectedFile && (
                                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm">{selectedFile.name}</span>
                                    </div>
                                    <button
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

                            <button
                                onClick={analyzeReport}
                                disabled={!selectedFile || loading}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Report'}
                            </button>

                            {reportSummary && (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold mb-2">Report Analysis:</h4>
                                    <div className="whitespace-pre-wrap text-sm text-gray-700">{reportSummary}</div>
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        ⚠️ This is an AI-generated summary for educational purposes only. It is NOT a medical diagnosis. Please consult a qualified healthcare professional for accurate interpretation.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorTools;

