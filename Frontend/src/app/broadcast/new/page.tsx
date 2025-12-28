"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useGetTemplates, useCreateBroadcast } from "@/hooks/useApi";
import TemplatePreview from "@/components/templates/TemplatePreview";
import { uploadMedia } from "@/api/whatsappApi";
import { getContactLists, getContactsInList } from "@/api/contactLists";

export default function NewBroadcastPage() {
    const router = useRouter();
    const [name, setName] = useState("");

    // contact list selection
    const [contactLists, setContactLists] = useState<Array<{ id: string; name: string; contact_count?: number }>>([]);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [listContacts, setListContacts] = useState<Array<{ id: string; name: string; phone: string }>>([]);

    // templates
    const { data: templates } = useGetTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const selectedTemplate = templates?.find((t: any) => t.id === selectedTemplateId) ?? null;

    // parameters derived from template
    const [headerParams, setHeaderParams] = useState<string[]>([]);
    const [bodyParams, setBodyParams] = useState<string[]>([]);
    const [headerType, setHeaderType] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const { mutate: create } = useCreateBroadcast();

    useEffect(() => {
        getContactLists().then((res) => setContactLists(res.lists));
    }, []);

    useEffect(() => {
        if (!selectedListId) {
            setListContacts([]);
            return;
        }
        getContactsInList(selectedListId).then(setListContacts);
    }, [selectedListId]);

    // whenever selectedTemplate changes, reset params
    useEffect(() => {
        if (!selectedTemplate) {
            setHeaderParams([]);
            setBodyParams([]);
            setHeaderType(undefined);
            setSelectedFile(null);
            return;
        }

        let hCount = 0;
        let bCount = 0;
        let hType: string | undefined = undefined;

        for (const comp of selectedTemplate.components || []) {
            if (comp.type === 'HEADER') {
                const format = comp.format?.toUpperCase();
                hType = format;
                
                if (format === 'TEXT' && comp.parameter_count) {
                    hCount = comp.parameter_count;
                } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format || '')) {
                    hCount = 1; // Media types need one parameter (URL or ID)
                }
            }
            if (comp.type === 'BODY' && comp.parameter_count) {
                bCount = comp.parameter_count;
            }
        }

        setHeaderType(hType);
        setHeaderParams(Array(hCount).fill(""));
        setBodyParams(Array(bCount).fill(""));
        setSelectedFile(null);
    }, [selectedTemplate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !selectedTemplate || listContacts.length === 0) {
            alert('Please provide a name, select a contact list with contacts, and choose a template');
            return;
        }

        // Validate header params for media types
        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType || '')) {
            if (!selectedFile && (!headerParams[0] || !headerParams[0].trim())) {
                alert(`Please upload a ${headerType?.toLowerCase()} or enter a URL/ID`);
                return;
            }
        }

        setSubmitting(true);
        try {
            // Determine header type from the selected template (if any)
            let headerTypeToSend: string | null = null;
            for (const comp of selectedTemplate.components || []) {
                if (comp.type === 'HEADER') {
                    headerTypeToSend = comp.format || 'TEXT';
                    break;
                }
            }

            let finalHeaderParams = [...headerParams];

            // Handle Media Upload if file selected
            if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType || '') && selectedFile) {
                try {
                    const uploadResp = await uploadMedia(selectedFile);
                    if (uploadResp && uploadResp.id) {
                        finalHeaderParams = [uploadResp.id];
                    } else {
                        throw new Error('Failed to get media ID from upload');
                    }
                } catch (uploadError: any) {
                    alert(`${headerType} upload failed: ` + uploadError.message);
                    setSubmitting(false);
                    return;
                }
            }

            const payload = {
                name,
                phones: listContacts.map((c) => c.phone),
                template_name: selectedTemplate.name,
                template_id: selectedTemplate.id,
                language_code: selectedTemplate.language,
                header_type: headerTypeToSend,
                header_parameters: finalHeaderParams.filter(Boolean),
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Recipients (Contact List)</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input px-3"
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                            >
                                <option value="">Select a contact list...</option>
                                {contactLists.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.contact_count ?? 0})</option>
                                ))}
                            </select>
                            <div className="rounded-md border bg-gray-50/60 p-3 text-sm space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Contacts in list</span>
                                    <span className="text-xs text-gray-500">{listContacts.length} selected</span>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {listContacts.length === 0 ? (
                                        <p className="text-xs text-gray-500">No contacts loaded. Choose a list with contacts.</p>
                                    ) : (
                                        listContacts.map((c) => (
                                            <div key={c.id} className="flex justify-between border rounded px-2 py-1">
                                                <span>{c.name || c.phone}</span>
                                                <span className="text-xs text-gray-500">{c.phone}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
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
                                        <label className="text-xs font-medium text-gray-500 uppercase">
                                            Header Parameters {headerType && `(${headerType})`}
                                        </label>
                                        
                                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType || '') && (
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-500">Upload {headerType}</label>
                                                <input
                                                    type="file"
                                                    accept={
                                                        headerType === 'IMAGE' ? "image/*" :
                                                            headerType === 'VIDEO' ? "video/*" :
                                                                headerType === 'DOCUMENT' ? ".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" :
                                                                    undefined
                                                    }
                                                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {selectedFile && (
                                                    <p className="text-xs text-green-600">✓ {selectedFile.name}</p>
                                                )}
                                                <p className="text-xs text-gray-400">Or enter a URL/ID below</p>
                                            </div>
                                        )}
                                        
                                        {headerParams.map((val, idx) => (
                                            <Input
                                                key={`h-${idx}`}
                                                placeholder={
                                                    headerType === 'TEXT' 
                                                        ? `Header Param {{${idx + 1}}}`
                                                        : `Media URL/ID`
                                                }
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
