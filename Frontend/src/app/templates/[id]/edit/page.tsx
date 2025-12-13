"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import TemplateForm from "@/components/templates/TemplateForm";
import { getTemplate, updateTemplate, Template } from "@/api/templates";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [template, setTemplate] = useState<Template | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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

    const handleSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            // Pass full data object for update (which is now create-replace)
            await updateTemplate(id, data);
            router.push("/templates");
        } catch (err) {
            console.error(err);
            alert("Failed to update template. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper title="Edit Template">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading template...</p>
                </div>
            </PageWrapper>
        );
    }

    if (error || !template) {
        return (
            <PageWrapper title="Edit Template">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-red-500">{error || "Template not found."}</p>
                    <Button variant="outline" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            title={`Edit Template: ${template.name}`}
            actions={
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            }
        >
            <TemplateForm
                initialData={template}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
            />
        </PageWrapper>
    );
}
