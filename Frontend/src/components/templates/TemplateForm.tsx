import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Template, TemplateComponent } from "@/api/templates";

interface TemplateFormProps {
    initialData?: Template;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function TemplateForm({ initialData, onSubmit, isSubmitting }: TemplateFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [language, setLanguage] = useState(initialData?.language || "en_US");
    const [headerText, setHeaderText] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [footerText, setFooterText] = useState("");

    // New state for parameters
    const [parameterFormat, setParameterFormat] = useState<"POSITIONAL" | "NAMED">("POSITIONAL");
    const [bodyVariables, setBodyVariables] = useState<string[]>([]);
    const [headerVariables, setHeaderVariables] = useState<string[]>([]);
    const [variableExamples, setVariableExamples] = useState<Record<string, string>>({});

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

            // Note: Editing existing templates with complex params is tricky, 
            // we focus on creation for now as per requirements.
        }
    }, [initialData]);

    // Parse variables when text changes
    useEffect(() => {
        const parseVariables = (text: string, format: "POSITIONAL" | "NAMED") => {
            if (!text) return [];
            const regex = format === "NAMED" ? /{{\s*([a-z0-9_]+)\s*}}/g : /{{\s*(\d+)\s*}}/g;
            const matches = [...text.matchAll(regex)];
            return matches.map(m => m[1]);
        };

        const bodyVars = parseVariables(bodyText, parameterFormat);
        const headerVars = parseVariables(headerText, parameterFormat);

        setBodyVariables(bodyVars);
        setHeaderVariables(headerVars);
    }, [bodyText, headerText, parameterFormat]);

    const handleExampleChange = (variable: string, value: string) => {
        setVariableExamples(prev => ({
            ...prev,
            [variable]: value
        }));
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
                if (parameterFormat === "NAMED") {
                    headerComponent.example = {
                        header_text_named_params: headerVariables.map(v => ({
                            param_name: v,
                            example: variableExamples[v] || "example"
                        }))
                    };
                } else {
                    headerComponent.example = {
                        header_text: [headerVariables.map(v => variableExamples[v] || "example")]
                    };
                }
            }
            components.push(headerComponent);
        }

        if (bodyText) {
            const bodyComponent: any = {
                type: "BODY",
                text: bodyText,
            };

            if (bodyVariables.length > 0) {
                if (parameterFormat === "NAMED") {
                    bodyComponent.example = {
                        body_text_named_params: bodyVariables.map(v => ({
                            param_name: v,
                            example: variableExamples[v] || "example"
                        }))
                    };
                } else {
                    bodyComponent.example = {
                        body_text: [bodyVariables.map(v => variableExamples[v] || "example")]
                    };
                }
            }
            components.push(bodyComponent);
        }

        if (footerText) {
            components.push({
                type: "FOOTER",
                text: footerText,
            });
        }

        const buttons = initialData?.components.find((c) => c.type === "BUTTONS");
        if (buttons) {
            components.push(buttons);
        }

        onSubmit({
            name,
            category,
            language,
            parameter_format: parameterFormat,
            components
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Template Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., welcome_message"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="MARKETING, UTILITY, etc."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Language</label>
                            <Input
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                placeholder="en_US"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parameter Format</label>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="POSITIONAL"
                                        checked={parameterFormat === "POSITIONAL"}
                                        onChange={() => setParameterFormat("POSITIONAL")}
                                    />
                                    Positional (&#123;&#123;1&#125;&#125;)
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="NAMED"
                                        checked={parameterFormat === "NAMED"}
                                        onChange={() => setParameterFormat("NAMED")}
                                    />
                                    Named (&#123;&#123;name&#125;&#125;)
                                </label>
                            </div>
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
                            placeholder={parameterFormat === "NAMED" ? "Hi {{name}}" : "Hi {{1}}"}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Body</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            placeholder={parameterFormat === "NAMED" ? "Hello {{name}}, welcome!" : "Hello {{1}}, welcome!"}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Footer (Optional)</label>
                        <Input
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Enter footer text..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Example Values Section */}
            {(bodyVariables.length > 0 || headerVariables.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Variable Examples</CardTitle>
                        <p className="text-sm text-gray-500">Provide example values for your variables (Required by Meta).</p>
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Template"}
                </Button>
            </div>
        </form>
    );
}
