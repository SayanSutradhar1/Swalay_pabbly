"use client";
    
import { useEffect, useState } from "react";

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export default function ConnectWhatsApp() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Facebook SDK
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "", // Ensure you have this env var
                autoLogAppEvents: true,
                xfbml: true,
                version: "v21.0", // Use the latest available version
            });
        };

        // Load SDK script
        (function (d, s, id) {
            if (d.getElementById(id)) return;
            const fjs = d.getElementsByTagName(s)[0];
            const js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            }
        })(document, "script", "facebook-jssdk");
    }, []);

    const launchWhatsAppSignup = () => {
        setLoading(true);
        setError(null);

        // Configuration for the Embedded Signup
        // You'll need to confirm these details from your setup (config_id, etc.)
        // For now, we launch with standard parameters.
        const configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID; // Pre-configured config ID from Meta App Dashboard

        // Fallback if no config ID (though usually required for newer flows) or direct login
        if (!window.FB) {
            setLoading(false);
            setError("Facebook SDK not loaded yet.");
            return;
        }

        window.FB.login(
            function (response: any) {
                if (response.authResponse) {
                    const accessToken = response.authResponse.accessToken;
                    // Use this token to exchange or fetch details. 
                    // Note: The message event listener approach is often used for the embedded flow specifically.
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
                }
            }
        );
    };

    // Listen for the message event from the Embedded Signup flow
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Security check: validate origin if necessary
            // if (event.origin !== "https://www.facebook.com") return;

            try {
                const data = JSON.parse(event.data);

                if (data.type === "WA_EMBEDDED_SIGNUP") {
                    // User completed the flow
                    const { waba_id, phone_number_id, code } = data.data;
                    console.log("Embedded Signup Data:", data.data);

                    // TODO: Send to backend
                    // await sendToBackend({ waba_id, phone_number_id, code });

                    // For now just alert or log
                    alert(`Connected! WABA: ${waba_id}, Phone: ${phone_number_id}`);
                }
            } catch (e) {
                // Not a JSON message or not relevant
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div className="mt-4">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
                onClick={launchWhatsAppSignup}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
                {loading ? "Connecting..." : "Connect WhatsApp"}
            </button>
        </div>
    );
}
