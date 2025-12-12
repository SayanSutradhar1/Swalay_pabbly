const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface TemplateComponent {
    type: 'BODY' | 'HEADER' | 'BUTTONS' | 'FOOTER';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    parameter_count?: number;
    buttons?: any[];
}

export interface Template {
    id: string;
    name: string;
    language: string;
    category: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT'; // Updated status type
    components: TemplateComponent[];
}

export const fetchTemplates = async (): Promise<Template[]> => {
    const response = await fetch(`${BACKEND_URL}/templates`);
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
};

export const syncTemplates = async (): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${BACKEND_URL}/templates`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to sync templates');
    }
    return response.json();
    return response.json();
};

export const getTemplate = async (id: string): Promise<Template> => {
    const response = await fetch(`${BACKEND_URL}/templates/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch template');
    }
    return response.json();
};

export const updateTemplate = async (id: string, components: any[]): Promise<any> => {
    const response = await fetch(`${BACKEND_URL}/templates/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update template');
    }
    return response.json();
};