import { useState, useEffect } from 'react';
import { useFacebookSDK } from '@/hooks/useFacebookSDK';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facebook } from 'lucide-react';

export default function FacebookLoginButton() {
    const { isLoaded, getAuthorizationUrl } = useFacebookSDK();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if we're returning from OAuth callback with an authorization code
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        
        if (code) {
            handleOAuthCallback(code);
        } else if (errorParam) {
            setError(`Facebook authorization failed: ${searchParams.get('error_description') || errorParam}`);
        }
    }, [searchParams]);

    const handleOAuthCallback = async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            // Exchange authorization code with backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/facebook/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.detail || 'Facebook authentication failed');
            }

            const data = await response.json();
            console.debug('[facebook-login] authentication successful');
            
            // Clean up URL and redirect
            window.history.replaceState({}, document.title, window.location.pathname);
            router.replace('/dashboard');
        } catch (err: any) {
            console.error("Facebook OAuth callback error:", err);
            setError(err.message || "Failed to authenticate with Facebook");
            setLoading(false);
        }
    };

    const handleLogin = () => {
        setLoading(true);
        setError(null);
        try {
            const authUrl = getAuthorizationUrl();
            // Redirect to Facebook authorization endpoint
            window.location.href = authUrl;
        } catch (err: any) {
            console.error("Facebook login error:", err);
            setError(err.message || "Failed to initiate Facebook login");
            setLoading(false);
        }
    };

    if (!isLoaded) return null; // Or a loading spinner

    return (
        <div className="w-full">
            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
            <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold py-3.5 rounded-full shadow-md transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
                <Facebook className="w-5 h-5 fill-current" />
                <span>{loading ? "Connecting..." : "Continue with Facebook Business"}</span>
            </button>
        </div>
    );
}
