import React, { useState } from 'react';
import AIChat from './AIChat';

const AIAssistantButton = () => {
    const [showChat, setShowChat] = useState(false);

    return (
        <>
            {/* Floating AI Assistant Button */}
            <button
                onClick={() => setShowChat(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110"
                title="AI Medical Assistant - Click to chat"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                    AI
                </span>
            </button>

            {/* Chat Modal */}
            {showChat && (
                <AIChat onClose={() => setShowChat(false)} />
            )}
        </>
    );
};

export default AIAssistantButton;

