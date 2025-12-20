"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditTemplatePage() {
    const router = useRouter();

    return (
        <PageWrapper
            title="Edit Template"
            actions={
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            }
        >
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Templates Cannot Be Edited</h3>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                Templates are managed by WhatsApp Business. You can view template details but cannot edit them directly.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
