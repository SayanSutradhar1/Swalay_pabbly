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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const components: any[] = [];

        if (headerText) {
            components.push({
                type: "HEADER",
                format: "TEXT",
                text: headerText,
            });
        }

        if (bodyText) {
            components.push({
                type: "BODY",
                text: bodyText,
            });
        }

        if (footerText) {
            components.push({
                type: "FOOTER",
                text: footerText,
            });
        }

        // Preserve buttons if they exist in initialData (editing buttons is complex)
        const buttons = initialData?.components.find((c) => c.type === "BUTTONS");
        if (buttons) {
            components.push(buttons);
        }

        onSubmit(components);
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
                                disabled={!!initialData} // Name cannot be changed for existing templates
                                placeholder="e.g., welcome_message"
                            />
                            {initialData && <p className="text-xs text-gray-500">Template name cannot be changed.</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={!!initialData} // Category usually fixed
                                placeholder="MARKETING, UTILITY, etc."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Language</label>
                            <Input
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                disabled={!!initialData}
                                placeholder="en_US"
                            />
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
                            placeholder="Enter header text..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Body</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            placeholder="Enter your message here. Use {{1}}, {{2}} for variables."
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

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Template"}
                </Button>
            </div>
        </form>
    );
}
