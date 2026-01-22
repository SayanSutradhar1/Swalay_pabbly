"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import OnboardingLayout from "@/components/layout/OnboardingLayout";
import { getProfile } from "@/api/profile";
import { Check, AlertCircle } from "lucide-react";

export default function OnboardingWelcomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("User");

    useEffect(() => {
        const loadUserName = async () => {
            try {
                const profile = await getProfile();
                setUserName(profile.email.split("@")[0] || "User");
            } catch (err) {
                console.error("Failed to load profile:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUserName();
    }, []);

    const features = [
        {
            icon: "📱",
            title: "Send Messages at Scale",
            description: "Connect your WhatsApp Business Account to reach thousands of customers instantly",
        },
        {
            icon: "🎨",
            title: "Professional Templates",
            description: "Use pre-approved templates for quick, consistent messaging campaigns",
        },
        {
            icon: "📊",
            title: "Track & Analyze",
            description: "Monitor delivery rates, engagement, and customer responses in real-time",
        },
    ];

    const handleGetStarted = () => {
        router.push("/onboarding/whatsapp");
    };

    const handleSkip = () => {
        router.push("/dashboard");
    };

    if (loading) {
        return (
            <OnboardingLayout
                step={1}
                totalSteps={3}
                title="Setting Up"
                subtitle="Loading your account..."
            >
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout
            step={1}
            totalSteps={3}
            title={`Welcome, ${userName}! 🎉`}
            subtitle="Let's set up your WhatsApp business account in just a few steps"
        >
            {error && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Features Grid */}
            <div className="grid gap-6 mb-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-300 transition"
                    >
                        <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 hidden md:block" />
                    </div>
                ))}
            </div>

            {/* Why WhatsApp */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-green-900">Why WhatsApp?</span>
                    {" "}
                    With over 2 billion users worldwide, WhatsApp is the most trusted messaging app for business communication. 
                    Connect today to unlock direct customer engagement.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleGetStarted}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Connect WhatsApp
                </button>
                <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    Skip for Now
                </button>
            </div>

            {/* Footer Note */}
            <p className="mt-6 text-center text-xs text-gray-500">
                You can always connect WhatsApp later from your profile settings
            </p>
        </OnboardingLayout>
    );
}
