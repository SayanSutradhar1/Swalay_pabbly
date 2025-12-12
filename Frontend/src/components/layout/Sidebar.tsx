"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Inbox,
    Users,
    MessageSquare,
    FileText,
    Radio,
    Workflow,
    Bot,
    Activity,
    CreditCard,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Inbox, label: "Inbox", href: "/inbox" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    { icon: MessageSquare, label: "Team Queues", href: "/team-queues" },
    { icon: FileText, label: "Templates", href: "/templates" },
    { icon: Radio, label: "Broadcast", href: "/broadcast" },
    { icon: Workflow, label: "Flows", href: "/flows" },
    { icon: Bot, label: "AI Assistant", href: "/ai-assistant" },
    { icon: Activity, label: "Activity Log", href: "/activity-log" },
    { icon: CreditCard, label: "WhatsApp Payment", href: "/whatsapp-payment" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r bg-gray-100/50 dark:bg-[#0d1117] dark:border-gray-700 transition-all duration-300 ease-in-out h-screen sticky top-0",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b bg-white dark:bg-[#0d1117] dark:border-gray-700">
                {!isCollapsed && <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Swalay</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-auto"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
                                isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400" : "text-gray-600 dark:text-gray-400",
                                isCollapsed ? "justify-center" : "justify-start"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
