import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Template } from "@/api/templates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Trash2, Plus } from "lucide-react";

interface TemplateFormProps {
    initialData?: Template;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function TemplateForm({ initialData, onSubmit, isSubmitting }: TemplateFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [category, setCategory] = useState(initialData?.category || "MARKETING");
    const [language, setLanguage] = useState(initialData?.language || "en_US");
    const [headerText, setHeaderText] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [footerText, setFooterText] = useState("");

    // New state for parameters
    const [bodyVariables, setBodyVariables] = useState<string[]>([]);
    const [headerVariables, setHeaderVariables] = useState<string[]>([]);
    const [variableExamples, setVariableExamples] = useState<Record<string, string>>({});
    const [buttons, setButtons] = useState<{ type: "QUICK_REPLY"; text: string }[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);
            setLanguage(initialData.language);

            const header = initialData.components.find((c) => c.type === "HEADER");
            if (header?.format === "TEXT") setHeaderText(header.text || "");

            const body = initialData.components.find((c) => c.type === "BODY");
            if (body) setBodyText(body.text || "");

            const footer = initialData.components.find((c) => c.type === "FOOTER");
            if (footer) setFooterText(footer.text || "");
        }
    }, [initialData]);

    // Parse variables when text changes
    useEffect(() => {
        const parseVariables = (text: string) => {
            if (!text) return [];
            // Only support positional {{1}}, {{2}} etc.
            const regex = /{{\s*(\d+)\s*}}/g;
            const matches = [...text.matchAll(regex)];
            return matches.map(m => m[1]);
        };

        const bodyVars = parseVariables(bodyText);
        const headerVars = parseVariables(headerText);

        setBodyVariables(bodyVars);
        setHeaderVariables(headerVars);
    }, [bodyText, headerText]);

    const handleExampleChange = (variable: string, value: string) => {
        setVariableExamples(prev => ({
            ...prev,
            [variable]: value
        }));
    };

    const handleAddButton = () => {
        if (buttons.length < 3) {
            setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
        }
    };

    const handleButtonChange = (index: number, text: string) => {
        const newButtons = [...buttons];
        newButtons[index].text = text;
        setButtons(newButtons);
    };

    const handleRemoveButton = (index: number) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const components: any[] = [];

        if (headerText) {
            const headerComponent: any = {
                type: "HEADER",
                format: "TEXT",
                text: headerText,
            };

            if (headerVariables.length > 0) {
                headerComponent.example = {
                    header_text: [variableExamples[headerVariables[0]] || "example"]
                };
            }
            components.push(headerComponent);
        }

        if (bodyText) {
            const bodyComponent: any = {
                type: "BODY",
                text: bodyText,
            };

            if (bodyVariables.length > 0) {
                // Body example expects List[List[str]] -> [["val1", "val2"]]
                const exampleValues = bodyVariables.map(v => variableExamples[v] || "example");
                bodyComponent.example = {
                    body_text: [exampleValues]
                };
            }
            components.push(bodyComponent);
        }

        if (footerText) {
            components.push({
                type: "FOOTER",
                text: footerText,
            });
        }

        if (buttons.length > 0) {
            components.push({
                type: "BUTTONS",
                buttons: buttons
            });
        }

        onSubmit({
            name,
            category,
            language,
            components
        });
    };

    // Helper to render text with highlighted variables
    const renderPreviewText = (text: string) => {
        if (!text) return null;
        const parts = text.split(/({{\d+}})/g);
        return parts.map((part, i) => {
            if (part.match(/^{{\d+}}$/)) {
                return <span key={i} className="bg-yellow-200 text-yellow-800 px-1 rounded mx-0.5">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Template Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                placeholder="e.g., welcome_message"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and underscores.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MARKETING">Marketing</SelectItem>
                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Language</label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en_US">English (US)</SelectItem>
                                        <SelectItem value="hi_IN">Hindi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Header (Optional)</label>
                            <Input
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                                placeholder="Header text..."
                                maxLength={60}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Body</label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={bodyText}
                                onChange={(e) => setBodyText(e.target.value)}
                                placeholder="Enter your message body here... Use {{1}} for variables."
                                required
                                maxLength={1024}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Footer (Optional)</label>
                            <Input
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                                placeholder="Footer text..."
                                maxLength={60}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Buttons (Optional)</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddButton}
                                    disabled={buttons.length >= 3}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Button
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {buttons.map((btn, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={btn.text}
                                            onChange={(e) => handleButtonChange(idx, e.target.value)}
                                            placeholder="Button Text"
                                            maxLength={25}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleRemoveButton(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(bodyVariables.length > 0 || headerVariables.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Variable Examples</CardTitle>
                            <p className="text-sm text-muted-foreground">Provide example values for your variables (Required by Meta).</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {headerVariables.map((v, i) => (
                                <div key={`header-${v}-${i}`} className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right">{v} (Header):</label>
                                    <Input
                                        value={variableExamples[v] || ""}
                                        onChange={(e) => handleExampleChange(v, e.target.value)}
                                        placeholder={`Example for ${v}`}
                                        required
                                    />
                                </div>
                            ))}
                            {bodyVariables.map((v, i) => (
                                <div key={`body-${v}-${i}`} className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right">{v} (Body):</label>
                                    <Input
                                        value={variableExamples[v] || ""}
                                        onChange={(e) => handleExampleChange(v, e.target.value)}
                                        placeholder={`Example for ${v}`}
                                        required
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? "Creating..." : "Submit Template"}
                    </Button>
                </div>
            </form>

            {/* Right Column: Preview */}
            <div className="hidden lg:block">
                <div className="sticky top-8">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-[320px] mx-auto bg-[#E5DDD5] rounded-[30px] p-4 min-h-[600px] border-8 border-gray-800 relative shadow-xl overflow-hidden">
                                {/* Status Bar Mock */}
                                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 rounded-t-[20px] z-10"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>

                                {/* Chat Area */}
                                <div className="mt-12 space-y-4">
                                    <div className="bg-white rounded-lg p-2 shadow-sm max-w-[90%] relative">
                                        {/* Header */}
                                        {headerText && (
                                            <div className="font-bold text-sm mb-1 pb-1 border-b border-gray-100">
                                                {renderPreviewText(headerText)}
                                            </div>
                                        )}

                                        {/* Body */}
                                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                            {bodyText ? renderPreviewText(bodyText) : <span className="text-gray-400 italic">Message body...</span>}
                                        </div>

                                        {/* Footer */}
                                        {footerText && (
                                            <div className="text-[10px] text-gray-500 mt-1 pt-1">
                                                {footerText}
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="text-[10px] text-gray-400 text-right mt-1">
                                            12:00 PM
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    {buttons.length > 0 && (
                                        <div className="space-y-1 max-w-[90%]">
                                            {buttons.map((btn, idx) => (
                                                <div key={idx} className="bg-white rounded-lg p-2.5 text-center text-[#00A5F4] text-sm font-medium shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                                    {btn.text || "Button Text"}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
