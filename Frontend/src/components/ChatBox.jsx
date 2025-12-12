import React, { useState, useRef, useEffect } from 'react';
import {
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    Mic,
    Send,
    Check,
    CheckCheck
} from 'lucide-react';

const ChatBox = ({ contact, initialMessages }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, contact]);

    // Reset messages when contact changes (for demo purposes, usually you'd fetch new messages)
    useEffect(() => {
        setMessages(initialMessages);
    }, [contact, initialMessages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage = {
            sender: "me",
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!contact) {
        return (
            <div className="flex-1 bg-[#0b1120] flex items-center justify-center text-slate-500">
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#0b1120] relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-[#0f172a] flex-shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                        {contact.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">{contact.name}</h2>
                        <p className="text-xs text-slate-400">WhatsApp Number</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-slate-400">
                    <button className="hover:text-white transition-colors"><Phone size={20} /></button>
                    <button className="hover:text-white transition-colors"><Video size={20} /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b1120] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {/* Date Divider */}
                <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400">
                        Today
                    </span>
                </div>

                {messages.map((msg, index) => {
                    const isMe = msg.sender === "me";
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[70%] md:max-w-[60%] rounded-lg px-4 py-2 relative shadow-sm ${isMe
                                        ? 'bg-green-600 text-white rounded-tr-none'
                                        : 'bg-[#1e293b] text-slate-200 rounded-tl-none'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-green-200' : 'text-slate-400'}`}>
                                    <span className="text-[10px]">
                                        {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && <CheckCheck size={12} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex-shrink-0">
                <div className="flex items-end space-x-2 max-w-4xl mx-auto">
                    <button className="p-3 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                        <Smile size={24} />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                        <Paperclip size={24} />
                    </button>

                    <div className="flex-1 bg-[#1e293b] rounded-lg border border-slate-700 focus-within:border-green-500 transition-colors flex items-center">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-transparent text-white px-4 py-3 max-h-32 focus:outline-none resize-none scrollbar-hide text-sm"
                            rows={1}
                            style={{ minHeight: '46px' }}
                        />
                    </div>

                    {inputText.trim() ? (
                        <button
                            onClick={handleSend}
                            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all transform hover:scale-105 shadow-lg"
                        >
                            <Send size={20} className="ml-0.5" />
                        </button>
                    ) : (
                        <button className="p-3 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                            <Mic size={24} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
