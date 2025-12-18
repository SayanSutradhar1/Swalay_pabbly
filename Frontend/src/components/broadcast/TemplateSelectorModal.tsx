import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Template {
    id: string;
    name: string;
    category: string;
    language: string;
    status: string;
}

interface TemplateSelectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (template: Template) => void;
}

const DUMMY_TEMPLATES: Template[] = [
    { id: '1', name: 'welcome_message', category: 'MARKETING', language: 'en_US', status: 'APPROVED' },
    { id: '2', name: 'order_confirmation', category: 'UTILITY', language: 'en_US', status: 'APPROVED' },
    { id: '3', name: 'payment_reminder', category: 'UTILITY', language: 'en_US', status: 'APPROVED' },
    { id: '4', name: 'diwali_offer', category: 'MARKETING', language: 'hi_IN', status: 'APPROVED' },
    { id: '5', name: 'feedback_request', category: 'UTILITY', language: 'en_US', status: 'APPROVED' },
];

export default function TemplateSelectorModal({ open, onOpenChange, onSelect }: TemplateSelectorModalProps) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredTemplates = DUMMY_TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirm = () => {
        const template = DUMMY_TEMPLATES.find(t => t.id === selectedId);
        if (template) {
            onSelect(template);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Select Template</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-md max-h-[300px] overflow-y-auto">
                        {filteredTemplates.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No templates found</div>
                        ) : (
                            <div className="divide-y">
                                {filteredTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedId === template.id ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                                        onClick={() => setSelectedId(template.id)}
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{template.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                <span>{template.language}</span>
                                                <span>•</span>
                                                <span>{template.category}</span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedId === template.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                            {selectedId === template.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedId}>Select Template</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
