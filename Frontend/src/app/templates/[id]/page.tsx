"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft } from "lucide-react";
import { getTemplate, Template } from "@/api/templates";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ViewTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [template, setTemplate] = useState<Template | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            loadTemplate();
        }
    }, [id]);

    const loadTemplate = async () => {
        setLoading(true);
        try {
            const data = await getTemplate(id);
            setTemplate(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load template.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper title="Loading...">
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading template details...</p>
                </div>
            </PageWrapper>
        );
    }

    if (error || !template) {
        return (
            <PageWrapper title="Error">
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                    <CardContent className="pt-6">
                        <p className="text-red-700 dark:text-red-200">{error || "Template not found"}</p>
                        <Button variant="outline" onClick={() => router.back()} className="mt-4">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </CardContent>
                </Card>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            title={`Template: ${template.name}`}
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            }
        >
            <div className="space-y-4">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-semibold mt-1">{template.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <p className="text-lg font-semibold mt-1">{template.category}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Language</label>
                                <p className="text-lg font-semibold mt-1">{template.language}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge
                                        variant={
                                            template.status === "APPROVED"
                                                ? "success"
                                                : template.status === "PENDING"
                                                    ? "warning"
                                                    : template.status === "REJECTED"
                                                        ? "destructive"
                                                        : "secondary"
                                        }
                                    >
                                        {template.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Components */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Template Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {template.components.map((component, idx) => (
                            <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline">{component.type}</Badge>
                                    {component.format && (
                                        <Badge variant="secondary">{component.format}</Badge>
                                    )}
                                </div>

                                {component.type === "HEADER" && (
                                    <div>
                                        {component.format === "TEXT" && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Text</label>
                                                <p className="text-sm mt-1 p-2 bg-background rounded border">{component.text}</p>
                                                {component.parameter_count && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Parameters: {component.parameter_count}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {["IMAGE", "VIDEO", "DOCUMENT"].includes(component.format || "") && (
                                            <div className="text-sm">
                                                <p className="text-muted-foreground">Media Format: <span className="font-semibold">{component.format}</span></p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {component.type === "BODY" && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Text</label>
                                        <p className="text-sm mt-1 p-2 bg-background rounded border whitespace-pre-wrap">{component.text}</p>
                                        {component.parameter_count && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Parameters: {component.parameter_count}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {component.type === "FOOTER" && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Text</label>
                                        <p className="text-sm mt-1 p-2 bg-background rounded border">{component.text}</p>
                                    </div>
                                )}

                                {component.type === "BUTTONS" && component.buttons && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Buttons</label>
                                        <div className="space-y-2">
                                            {component.buttons.map((button: any, bidx: number) => (
                                                <div key={bidx} className="p-2 bg-background rounded border text-sm">
                                                    <p className="font-medium">{button.text}</p>
                                                    {button.type && (
                                                        <p className="text-xs text-muted-foreground">Type: {button.type}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
