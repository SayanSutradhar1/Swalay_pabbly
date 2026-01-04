"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

    if (isAuthRoute) {
        return (
            <main className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    {children}
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex-1 p-6">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
