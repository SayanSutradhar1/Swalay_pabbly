"use client";

import React, { useState, useEffect } from 'react';
import { getTemplates, sendMessage, sendTemplate, getHealth, Template } from '../api/whatsappApi';

interface LogItem {
    type: 'template' | 'message' | 'error' | 'success';
    content: string;
    timestamp: string;
}

export default function WhatsAppConsole() {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [bodyParams, setBodyParams] = useState<string[]>([]);
    const [headerParams, setHeaderParams] = useState<string[]>([]);
    const [headerType, setHeaderType] = useState<string | undefined>(undefined);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

    useEffect(() => {
        checkHealth();
        fetchTemplates();
    }, []);

    const checkHealth = async () => {
        try {
            await getHealth();
            setBackendStatus('connected');
        } catch (error) {
            setBackendStatus('disconnected');
            addLog('error', 'Backend is disconnected');
        }
    };

    const fetchTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (error) {
            addLog('error', 'Failed to fetch templates');
        }
    };

    const addLog = (type: LogItem['type'], content: string) => {
        setLogs(prev => [{ type, content, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = e.target.value;
        const template = templates.find(t => t.name === templateName) || null;
        setSelectedTemplate(template);

        if (template) {
            // Parse Body Params
            const bodyComponent = template.components.find(c => c.type === 'BODY');
            const bodyCount = bodyComponent?.parameter_count || 0;
            setBodyParams(new Array(bodyCount).fill(''));

            // Parse Header Params
            const headerComponent = template.components.find(c => c.type === 'HEADER');
            if (headerComponent && headerComponent.format && headerComponent.format !== 'TEXT') {
                // Media Header (Image, Video, Document) - expects 1 URL param
                setHeaderParams(['']);
                setHeaderType(headerComponent.format);
            } else if (headerComponent && headerComponent.format === 'TEXT') {
                // Text Header - expects N params
                const headerCount = headerComponent.parameter_count || 0;
                setHeaderParams(new Array(headerCount).fill(''));
                setHeaderType('TEXT');
            } else {
                setHeaderParams([]);
                setHeaderType(undefined);
            }

        } else {
            setBodyParams([]);
            setHeaderParams([]);
            setHeaderType(undefined);
        }
    };

    const handleBodyParamChange = (index: number, value: string) => {
        const newParams = [...bodyParams];
        newParams[index] = value;
        setBodyParams(newParams);
    };

    const handleHeaderParamChange = (index: number, value: string) => {
        const newParams = [...headerParams];
        newParams[index] = value;
        setHeaderParams(newParams);
    };

    const handleSendTemplate = async () => {
        if (!phone || !selectedTemplate) {
            addLog('error', 'Phone and Template are required');
            return;
        }
        if (bodyParams.some(p => !p)) {
            addLog('error', 'All body parameters must be filled');
            return;
        }
        if (headerParams.some(p => !p)) {
            addLog('error', 'All header parameters must be filled');
            return;
        }

        setLoading(true);
        try {
            await sendTemplate({
                phone,
                template_name: selectedTemplate.name,
                language_code: selectedTemplate.language,
                body_parameters: bodyParams,
                header_parameters: headerParams,
                header_type: headerType
            });
            addLog('success', `Sent template "${selectedTemplate.name}" to ${phone}`);
            addLog('template', `Template: ${selectedTemplate.name}, Body: [${bodyParams.join(', ')}], Header: [${headerParams.join(', ')}]`);
        } catch (error: any) {
            addLog('error', error.message || 'Failed to send template');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!phone || !message) {
            addLog('error', 'Phone and Message are required');
            return;
        }

        setLoading(true);
        try {
            await sendMessage({ phone, message });
            addLog('success', `Sent message to ${phone}`);
            addLog('message', `You: ${message}`);
            setMessage('');
        } catch (error: any) {
            addLog('error', error.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-slate-800">
            {/* Left Column: Configuration & Template */}
            <div className="md:col-span-1 space-y-6">

                {/* Status Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Backend Status</span>
                    <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' :
                                backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></span>
                        <span className="text-sm text-slate-600 capitalize">{backendStatus}</span>
                    </div>
                </div>

                {/* Recipient Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Recipient</h2>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-600">Phone Number</label>
                        <input
                            type="text"
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        />
                        <p className="text-xs text-slate-400">Enter full international format without spaces.</p>
                    </div>
                </div>

                {/* Template Sender Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Send Template</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Select Template</label>
                            <select
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                onChange={handleTemplateChange}
                                value={selectedTemplate?.name || ''}
                            >
                                <option value="">-- Select a Template --</option>
                                {templates.map((t) => (
                                    <option key={t.name} value={t.name}>
                                        {t.name} ({t.language})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Header Parameters */}
                        {selectedTemplate && headerParams.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-600">
                                    Header Parameters ({headerType})
                                </p>
                                {headerParams.map((param, index) => (
                                    <input
                                        key={`header-${index}`}
                                        type="text"
                                        placeholder={headerType === 'TEXT' ? `Header Param ${index + 1}` : `Media URL (${headerType})`}
                                        value={param}
                                        onChange={(e) => handleHeaderParamChange(index, e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-green-500 outline-none text-sm"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Body Parameters */}
                        {selectedTemplate && bodyParams.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-600">Body Parameters</p>
                                {bodyParams.map((param, index) => (
                                    <input
                                        key={`body-${index}`}
                                        type="text"
                                        placeholder={`Body Param ${index + 1}`}
                                        value={param}
                                        onChange={(e) => handleBodyParamChange(index, e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-green-500 outline-none text-sm"
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleSendTemplate}
                            disabled={loading || !selectedTemplate}
                            className={`w-full py-2 px-4 rounded font-medium text-white transition ${loading || !selectedTemplate
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? 'Sending...' : 'Send Template'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Message & History */}
            <div className="md:col-span-2 space-y-6">

                {/* Normal Message Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Send Message</h2>
                    <div className="space-y-4">
                        <textarea
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 outline-none resize-none"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSendMessage}
                                disabled={loading || !message}
                                className={`py-2 px-6 rounded font-medium text-white transition ${loading || !message
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Log Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-96 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Activity Log</h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {logs.length === 0 && (
                            <p className="text-slate-400 text-center italic mt-10">No activity yet.</p>
                        )}
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded border-l-4 text-sm ${log.type === 'error'
                                    ? 'bg-red-50 border-red-500 text-red-700'
                                    : log.type === 'success'
                                        ? 'bg-green-50 border-green-500 text-green-700'
                                        : 'bg-slate-50 border-slate-400 text-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold uppercase text-xs tracking-wide opacity-80">{log.type}</span>
                                    <span className="text-xs opacity-60">{log.timestamp}</span>
                                </div>
                                <p className="whitespace-pre-wrap">{log.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
