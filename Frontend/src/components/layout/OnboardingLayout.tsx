"use client";

import { ReactNode } from "react";
import { MessageSquare } from "lucide-react";

interface OnboardingLayoutProps {
    children: ReactNode;
    step?: number;
    totalSteps?: number;
    title?: string;
    subtitle?: string;
}

export default function OnboardingLayout({
    children,
    step = 1,
    totalSteps = 3,
    title,
    subtitle,
}: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header */}
            <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Swalay</h1>
                    </div>

                    {/* Progress */}
                    {totalSteps && step && (
                        <div className="text-sm text-gray-500 font-medium">
                            Step {step} of {totalSteps}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4 py-8">
                <div className="w-full max-w-2xl">
                    {/* Title & Subtitle */}
                    {title && (
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Content Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
                        {children}
                    </div>

                    {/* Progress Indicator */}
                    {totalSteps && step && (
                        <div className="mt-8 flex items-center justify-center space-x-2">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all ${
                                        index < step
                                            ? "bg-blue-600 w-8"
                                            : index === step
                                            ? "bg-blue-400 w-6"
                                            : "bg-gray-300 w-4"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
