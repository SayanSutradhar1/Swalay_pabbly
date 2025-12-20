"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useGetTemplates, useCreateBroadcast } from "@/hooks/useApi";
import TemplatePreview from "@/components/templates/TemplatePreview";

export default function NewBroadcastPage() {
    const router = useRouter();
    const [name, setName] = useState("");

    // phones list inputs
    const [phoneInput, setPhoneInput] = useState("");
    const [phones, setPhones] = useState<string[]>([]);

    // templates
    const { data: templates } = useGetTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const selectedTemplate = templates?.find((t: any) => t.id === selectedTemplateId) ?? null;

    // parameters derived from template
    const [headerParams, setHeaderParams] = useState<string[]>([]);
    const [bodyParams, setBodyParams] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const { mutate: create } = useCreateBroadcast();

    const addPhone = () => {
        const p = phoneInput.trim();
        if (!p) return;
        setPhones((prev) => [...prev, p]);
        setPhoneInput("");
    };

    const removePhone = (idx: number) => {
        setPhones((prev) => prev.filter((_, i) => i !== idx));
    };

    // whenever selectedTemplate changes, reset params
    useEffect(() => {
        if (!selectedTemplate) {
            setHeaderParams([]);
            setBodyParams([]);
            return;
        }

        let hCount = 0;
        let bCount = 0;

        for (const comp of selectedTemplate.components || []) {
            if (comp.type === 'HEADER' && comp.format === 'TEXT' && comp.parameter_count) {
                hCount = comp.parameter_count;
            }
            if (comp.type === 'BODY' && comp.parameter_count) {
                bCount = comp.parameter_count;
            }
        }

        setHeaderParams(Array(hCount).fill(""));
        setBodyParams(Array(bCount).fill(""));
    }, [selectedTemplate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || phones.length === 0 || !selectedTemplate) {
            alert('Please provide a name, at least one phone, and select a template');
            return;
        }

        setSubmitting(true);
        try {
            // Determine header type from the selected template (if any)
            let headerType: string | null = null;
            for (const comp of selectedTemplate.components || []) {
                if (comp.type === 'HEADER') {
                    headerType = comp.format || 'TEXT';
                    break;
                }
            }

            const payload = {
                name,
                phones,
                template_name: selectedTemplate.name,
                template_id: selectedTemplate.id,
                language_code: selectedTemplate.language,
                header_type: headerType,
                header_parameters: headerParams.filter(Boolean),
                body_parameters: bodyParams.filter(Boolean),
            };

            await create(payload);
            alert('Broadcast created');
            router.push('/broadcast');
        } catch (err) {
            console.error(err);
            alert('Failed to create broadcast');
        } finally {
            setSubmitting(false);
        }
    };

    // Construct preview data
    const getPreviewData = () => {
        if (!selectedTemplate) return {};

        let headerText = "";
        let bodyText = "";
        let buttons = [];
        let type = "TEXT";
        let headerFile = null; // We don't support file upload for broadcast yet, or it's not in the requirements to preview it dynamically from upload

        for (const comp of selectedTemplate.components || []) {
            if (comp.type === 'HEADER') {
                if (comp.format === 'TEXT') {
                    headerText = comp.text || "";
                    // Replace params
                    headerParams.forEach((val, i) => {
                        headerText = headerText.replace(`{{${i + 1}}}`, val || `{{${i + 1}}}`);
                    });
                } else {
                    type = comp.format || "TEXT";
                }
            }
            if (comp.type === 'BODY') {
                bodyText = comp.text || "";
                // Replace params
                bodyParams.forEach((val, i) => {
                    bodyText = bodyText.replace(`{{${i + 1}}}`, val || `{{${i + 1}}}`);
                });
            }
            if (comp.type === 'BUTTONS') {
                buttons = comp.buttons || [];
            }
        }

        return {
            name: selectedTemplate.name,
            language: selectedTemplate.language,
            type,
            header_text: headerText,
            body_text: bodyText,
            buttons,
            category: selectedTemplate.category
        };
    };

    return (
        <PageWrapper
            title="Create New Broadcast"
            actions={
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Broadcast Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My broadcast" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Recipients</label>
                            <div className="flex gap-2">
                                <Input placeholder="Enter phone number" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                <Button type="button" onClick={addPhone}>Add</Button>
                            </div>
                            <div className="mt-3 space-y-1">
                                {phones.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
                                        <div className="text-sm">{p}</div>
                                        <Button variant="ghost" size="sm" onClick={() => removePhone(idx)}>Remove</Button>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500">You can add multiple recipients. Use E.164 format where possible.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Template</label>
                            <select className="flex h-10 w-full rounded-md border border-input px-3" value={selectedTemplateId || ''} onChange={(e) => setSelectedTemplateId(e.target.value || null)}>
                                <option value="">Select a template...</option>
                                {templates?.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                                ))}
                            </select>
                        </div>

                        {selectedTemplate && (
                            <div className="space-y-4 border rounded-md p-4 bg-gray-50/50">
                                <h3 className="font-medium text-sm">Template Parameters</h3>

                                {headerParams.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase">Header Parameters</label>
                                        {headerParams.map((val, idx) => (
                                            <Input
                                                key={`h-${idx}`}
                                                placeholder={`Header Param {{${idx + 1}}}`}
                                                value={val}
                                                onChange={(e) => setHeaderParams(prev => { const copy = [...prev]; copy[idx] = e.target.value; return copy; })}
                                            />
                                        ))}
                                    </div>
                                )}

                                {bodyParams.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase">Body Parameters</label>
                                        {bodyParams.map((val, idx) => (
                                            <Input
                                                key={`b-${idx}`}
                                                placeholder={`Body Param {{${idx + 1}}}`}
                                                value={val}
                                                onChange={(e) => setBodyParams(prev => { const copy = [...prev]; copy[idx] = e.target.value; return copy; })}
                                            />
                                        ))}
                                    </div>
                                )}

                                {headerParams.length === 0 && bodyParams.length === 0 && (
                                    <div className="text-sm text-gray-500">No parameters required for this template.</div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Create Broadcast'}</Button>
                            <Button variant="outline" onClick={() => router.push('/broadcast')}>Cancel</Button>
                        </div>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="hidden lg:block">
                    {selectedTemplate ? (
                        <TemplatePreview data={getPreviewData() as any} />
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg text-gray-400">
                            Select a template to view preview
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
