"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/layout/OnboardingLayout";
import { getProfile } from "@/api/profile";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function OnboardingSuccessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [whatsappInfo, setWhatsappInfo] = useState<{
        waba_id?: string;
        phone_number_id?: string;
    }>({});

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await getProfile();
                if (profile.whatsapp_connected) {
                    setWhatsappInfo({
                        waba_id: profile.whatsapp_waba_id,
                        phone_number_id: profile.whatsapp_phone_number_id,
                    });
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleGoToDashboard = () => {
        router.push("/dashboard");
    };

    const handleExplore = () => {
        router.push("/templates");
    };

    if (loading) {
        return (
            <OnboardingLayout
                step={3}
                totalSteps={3}
                title="Finalizing Setup"
                subtitle="Just a moment..."
            >
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout
            step={3}
            totalSteps={3}
            title="WhatsApp Connected! 🎉"
            subtitle="Your business account is ready to go"
        >
            {/* Success Animation */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-20 scale-125"></div>
                    <CheckCircle className="h-20 w-20 text-green-500 relative z-10" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Message */}
            <div className="text-center mb-8">
                <p className="text-xl text-gray-700 mb-2">
                    Your WhatsApp Business Account is now connected to Swalay!
                </p>
                <p className="text-gray-600 mb-6">
                    You're all set to start sending messages, creating broadcast campaigns, and engaging with your customers.
                </p>
            </div>

            {/* Account Details Card */}
            {whatsappInfo.waba_id && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-4">📱 Connected Account Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-green-800">Business Account ID:</span>
                            <span className="font-mono text-green-900 font-semibold">{whatsappInfo.waba_id}</span>
                        </div>
                        {whatsappInfo.phone_number_id && (
                            <div className="flex justify-between items-center">
                                <span className="text-green-800">Phone Number ID:</span>
                                <span className="font-mono text-green-900 font-semibold">{whatsappInfo.phone_number_id}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Next Steps */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4">🚀 What's Next?</h3>
                <ol className="space-y-3 text-sm text-blue-800">
                    <li className="flex gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                            1
                        </span>
                        <span><strong>Create Templates</strong> - Design message templates that comply with Meta's policies</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                            2
                        </span>
                        <span><strong>Build Contact Lists</strong> - Import or add customer contacts to send messages to</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                            3
                        </span>
                        <span><strong>Launch Broadcasts</strong> - Send campaigns to your entire contact list</span>
                    </li>
                </ol>
            </div>

            {/* Features Available */}
            <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm font-semibold text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-600 mt-1">Track delivery & engagement</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-sm font-semibold text-gray-900">Templates</p>
                    <p className="text-xs text-gray-600 mt-1">Create & manage templates</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 text-center">
                    <div className="text-2xl mb-2">📲</div>
                    <p className="text-sm font-semibold text-gray-900">Contacts</p>
                    <p className="text-xs text-gray-600 mt-1">Manage your customer lists</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm font-semibold text-gray-900">Broadcasts</p>
                    <p className="text-xs text-gray-600 mt-1">Send bulk messages</p>
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleExplore}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                >
                    Create First Template
                    <ArrowRight className="h-4 w-4" />
                </button>
                <button
                    onClick={handleGoToDashboard}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    Go to Dashboard
                </button>
            </div>

            {/* Footer Message */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-center">
                <p className="text-white text-sm font-medium">
                    ✨ Welcome to Swalay! You're now ready to transform your customer engagement.
                </p>
            </div>
        </OnboardingLayout>
    );
}
