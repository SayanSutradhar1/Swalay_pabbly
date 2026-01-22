"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/layout/OnboardingLayout";
import { connectWhatsApp } from "@/api/profile";
import { AlertCircle, Loader2, Phone } from "lucide-react";

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export default function OnboardingWhatsAppPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fbReady, setFbReady] = useState(false);
    const router = useRouter();

    // Load Facebook SDK
    useEffect(() => {
        // Check if FB is already initialized
        if (window.FB) {
            setFbReady(true);
            return;
        }

        window.fbAsyncInit = function () {
            if (!window.FB) {
                console.error("Facebook SDK failed to initialize");
                setError("Facebook SDK failed to load. Please refresh the page.");
                return;
            }

            const appId = process.env.NEXT_PUBLIC_META_APP_ID;
            if (!appId) {
                console.error("NEXT_PUBLIC_META_APP_ID is not configured");
                setError("Configuration error: Meta App ID not set. Contact support.");
                return;
            }

            window.FB.init({
                appId: appId,
                autoLogAppEvents: true,
                xfbml: true,
                version: "v21.0",
            });
            console.log("Facebook SDK initialized successfully");
            setFbReady(true);
        };

        // Load SDK script
        (function (d, s, id) {
            if (d.getElementById(id)) return;
            const fjs = d.getElementsByTagName(s)[0];
            const js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            js.async = true;
            js.defer = true;
            js.onerror = () => {
                console.error("Failed to load Facebook SDK script");
                setError("Failed to load Facebook SDK. Please check your internet connection.");
            };
            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            }
        })(document, "script", "facebook-jssdk");

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Listen for the message event from the Embedded Signup flow
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "WA_EMBEDDED_SIGNUP") {
                    const { waba_id, phone_number_id, code } = data.data;
                    console.log("Embedded Signup Data:", data.data);

                    try {
                        setLoading(true);
                        setError(null);

                        // Send to backend
                        await connectWhatsApp({
                            waba_id,
                            phone_number_id,
                            code,
                            flow_id: "onboarding",
                        });

                        console.log("WhatsApp connected successfully!");
                        // Navigate to success page
                        router.push("/onboarding/success");
                    } catch (err: any) {
                        console.error("Failed to connect WhatsApp:", err);
                        setError(err.message || "Failed to connect WhatsApp. Please try again.");
                        setLoading(false);
                    }
                }
            } catch (e) {
                // Not a JSON message or not relevant
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [router]);

    const launchWhatsAppSignup = () => {
        if (!window.FB) {
            setError("Facebook SDK not loaded yet. Please refresh and try again.");
            return;
        }

        setLoading(true);
        setError(null);

        window.FB.login(
            function (response: any) {
                if (response.authResponse) {
                    console.log("Facebook Login Success", response);
                } else {
                    console.log("User cancelled login or did not fully authorize.");
                    setLoading(false);
                }
            },
            {
                scope: "whatsapp_business_management, whatsapp_business_messaging",
                extras: {
                    feature: "whatsapp_embedded_signup",
                    version: 2,
                    sessionInfoVersion: 2,
                },
            }
        );
    };

    const handleSkip = () => {
        router.push("/dashboard");
    };

    return (
        <OnboardingLayout
            step={2}
            totalSteps={3}
            title="Connect WhatsApp Business"
            subtitle="Securely connect your Meta Business Account to start messaging"
        >
            {error && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-900 font-semibold text-sm mb-1">Connection Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Information Cards */}
            <div className="grid gap-4 mb-8">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        What You Need
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                        <li>Meta Business Account</li>
                        <li>WhatsApp Business Account</li>
                        <li>Admin access to your Business Account</li>
                    </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                        ✅ What Happens Next
                    </h3>
                    <ol className="text-sm text-green-800 space-y-1 ml-6 list-decimal">
                        <li>You'll be redirected to Meta's secure login</li>
                        <li>Authenticate with your Meta Business Account</li>
                        <li>Select your WhatsApp Business Account</li>
                        <li>Your account will be connected automatically</li>
                    </ol>
                </div>
            </div>

            {/* Security Note */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                    <span className="font-semibold">🔒 Your Security:</span> We never store your Meta password. 
                    We only use secure tokens from Meta to manage your WhatsApp account.
                </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={launchWhatsAppSignup}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Phone className="h-5 w-5" />
                            Connect WhatsApp
                        </>
                    )}
                </button>
                <button
                    onClick={handleSkip}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-900 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                >
                    Skip
                </button>
            </div>

            {/* Help Link */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-600">
                    Having trouble?{" "}
                    <a
                        href="/help"
                        className="text-blue-600 hover:text-blue-700 font-semibold underline"
                    >
                        Get help
                    </a>
                </p>
            </div>
        </OnboardingLayout>
    );
}
