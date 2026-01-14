"use client";

import { useEffect, useState } from "react";
import { getProfile, disconnectWhatsApp, ProfileResponse } from "@/api/profile";
import ConnectWhatsApp from "@/components/integrations/ConnectWhatsApp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Mail, User, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState(false);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProfile();
            setProfile(data);
        } catch (err: any) {
            console.error("Failed to fetch profile:", err);
            setError(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect WhatsApp?")) {
            return;
        }

        try {
            setDisconnecting(true);
            await disconnectWhatsApp();
            // Refresh profile
            await fetchProfile();
        } catch (err: any) {
            console.error("Failed to disconnect:", err);
            alert(err.message || "Failed to disconnect WhatsApp");
        } finally {
            setDisconnecting(false);
        }
    };

    const handleWhatsAppConnected = () => {
        // Refresh profile after successful connection
        fetchProfile();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-6 max-w-md">
                    <div className="text-center">
                        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchProfile}>Try Again</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            {/* User Information */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                </h2>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{profile?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="font-medium">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">User ID</p>
                            <p className="font-mono text-sm">{profile?.id}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* WhatsApp Integration */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp Integration
                </h2>

                {profile?.whatsapp_connected ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-green-900 dark:text-green-100">
                                    WhatsApp Connected
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    Your WhatsApp Business account is successfully connected.
                                </p>
                                {profile.whatsapp_phone_number_id && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono">
                                        Phone Number ID: {profile.whatsapp_phone_number_id}
                                    </p>
                                )}
                                {profile.whatsapp_waba_id && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                                        WABA ID: {profile.whatsapp_waba_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                        >
                            {disconnecting ? "Disconnecting..." : "Disconnect WhatsApp"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                                    WhatsApp Not Connected
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    Connect your WhatsApp Business account to start sending messages.
                                </p>
                            </div>
                        </div>

                        <ConnectWhatsApp onSuccess={handleWhatsAppConnected} />
                    </div>
                )}
            </Card>
        </div>
    );
}
