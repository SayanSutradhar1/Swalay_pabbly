import { cn } from "@/lib/utils";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    actions?: React.ReactNode;
}

export function PageWrapper({ children, className, title, actions }: PageWrapperProps) {
    return (
        <div className={cn("flex-1 space-y-4 p-8 pt-6", className)}>
            {(title || actions) && (
                <div className="flex items-center justify-between space-y-2 mb-6">
                    {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
                    {actions && <div className="flex items-center space-x-2">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
