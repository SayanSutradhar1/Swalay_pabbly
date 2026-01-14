const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface ProfileResponse {
    id: string;
    email: string;
    created_at: string;
    whatsapp_connected: boolean;
    whatsapp_phone_number_id?: string;
    whatsapp_waba_id?: string;
}

export const getProfile = async (): Promise<ProfileResponse> => {
    const response = await fetch(`${BACKEND_URL}/profile`, {
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.detail || 'Failed to fetch profile';
        throw new Error(message);
    }

    return response.json();
};

export const disconnectWhatsApp = async () => {
    const response = await fetch(`${BACKEND_URL}/profile/whatsapp`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.detail || 'Failed to disconnect WhatsApp';
        throw new Error(message);
    }

    return response.json();
};

export interface WhatsAppSignupPayload {
    code: string;
    waba_id: string;
    phone_number_id: string;
    flow_id?: string;
}

export const connectWhatsApp = async (payload: WhatsAppSignupPayload) => {
    const response = await fetch(`${BACKEND_URL}/onboarding/whatsapp/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.detail || 'Failed to connect WhatsApp';
        throw new Error(message);
    }

    return response.json();
};
