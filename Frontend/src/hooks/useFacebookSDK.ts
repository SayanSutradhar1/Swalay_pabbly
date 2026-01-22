import { useState, useEffect } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export const useFacebookSDK = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (window.FB) {
            setIsLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_META_APP_ID || "",
                cookie: true,
                xfbml: true,
                version: "v21.0",
            });
            setIsLoaded(true);
        };

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

    const getAuthorizationUrl = (): string => {
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        const redirectUri = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI;
        const scopes = ['business_management', 'whatsapp_business_management'];
        
        if (!appId || !redirectUri) {
            throw new Error("Missing META_APP_ID or FACEBOOK_REDIRECT_URI environment variables");
        }

        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            scope: scopes.join(','),
            response_type: 'code',
            state: generateRandomState(),
        });

        return `https://www.facebook.com/${process.env.NEXT_PUBLIC_META_API_VERSION || 'v21.0'}/dialog/oauth?${params.toString()}`;
    };

    const generateRandomState = (): string => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    return { isLoaded, getAuthorizationUrl };
};
