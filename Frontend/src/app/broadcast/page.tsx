"use client";

import { PageWrapper } from "@/components/ui/PageWrapper";
import BroadcastForm from "@/components/broadcast/BroadcastForm";

export default function BroadcastPage() {
    return (
        <PageWrapper title="Create Broadcast">
            <BroadcastForm />
        </PageWrapper>
    );
}
