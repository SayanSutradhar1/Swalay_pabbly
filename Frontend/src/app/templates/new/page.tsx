"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import TemplateForm from "@/components/templates/TemplateForm";
import { createTemplate } from "@/api/templates";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function NewTemplatePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            await createTemplate(data);
            router.push("/templates");
        } catch (err) {
            console.error(err);
            alert("Failed to create template. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageWrapper
            title="Create New Template"
            actions={
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            }
        >
            <TemplateForm
                onSubmit={handleSubmit}
                isSubmitting={submitting}
            />
        </PageWrapper>
    );
}
