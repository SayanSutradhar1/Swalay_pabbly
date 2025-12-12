# WhatsApp Communication Console

A React + FastAPI application for managing WhatsApp communications via the Meta Cloud API. This project allows sending template messages, normal text messages, and handling incoming webhooks.

## Architecture

```
Frontend (React) -> Backend (FastAPI) -> WhatsApp Cloud API
                                      <- Webhook from WhatsApp -> Backend
```

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- WhatsApp Cloud API account (Meta for Developers)

## Setup Instructions

### Backend

1.  Navigate to the `Backend` directory.
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in the `Backend` directory with the following variables:
    ```env
    WHATSAPP_ACCESS_TOKEN=your_access_token
    WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
    WHATSAPP_WABA_ID=your_waba_id
    WHATSAPP_API_VERSION=v20.0
    VERIFY_TOKEN=your_webhook_verify_token
    FRONTEND_ORIGIN=http://localhost:3000
    ```
5.  Run the server:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

### Frontend

1.  Navigate to the `Frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the `Frontend` directory:
    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  Open [http://localhost:3000](http://localhost:3000) in your browser.
2.  **Recipient**: Enter the destination phone number in international format (e.g., `15551234567`).
3.  **Send Template**:
    -   Select an approved template from the dropdown.
    -   Fill in any required parameters.
    -   Click "Send Template".
4.  **Send Message**:
    -   Type a text message.
    -   Click "Send Message".
5.  **Activity Log**: View the history of sent messages and any errors.

## Webhook

The backend exposes a `GET /webhook` for verification and `POST /webhook` for receiving messages. Configure your Meta App's Callback URL to point to your deployed backend URL (or use a tunnel like ngrok for local development).

## Future Improvements

-   Database integration for persistent message history.
-   Real-time incoming message display using WebSockets.
-   Support for media messages and interactive buttons.
