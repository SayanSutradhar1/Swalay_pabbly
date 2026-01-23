# Swalay - WhatsApp Business Communication Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.7+-010101?style=flat-square&logo=socket.io" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/WhatsApp_Cloud_API-v20.0-25D366?style=flat-square&logo=whatsapp" alt="WhatsApp" />
</p>

A full-stack WhatsApp Business Communication Platform built with **Next.js 14** and **FastAPI**. Manage customer conversations, send broadcast campaigns, create message templates, and leverage AI-powered chatbot assistance—all through the official WhatsApp Cloud API.

---

## 🚀 Features

### Core Messaging
- **📬 Real-time Inbox** - Live chat interface with WebSocket-powered message updates
- **📤 Template Messages** - Send pre-approved WhatsApp template messages with dynamic parameters
- **💬 Free-form Messaging** - Send text messages within the 24-hour customer service window
- **📎 Media Support** - Send and receive images, documents, and other media types

### Campaigns & Broadcasts
- **📢 Bulk Broadcasting** - Send template messages to multiple contacts simultaneously
- **📊 Campaign Tracking** - Monitor delivery status (sent, delivered, read, failed) per recipient
- **📋 Contact Lists** - Organize contacts into lists for targeted campaigns

### Contact Management
- **👥 Contact Database** - Store and manage customer contact information
- **📁 Contact Lists** - Group contacts for organized broadcast campaigns
- **🏷️ Contact Segmentation** - Tag and categorize contacts

### Templates
- **📝 Template Management** - View, create, and manage WhatsApp message templates
- **🔄 Sync with Meta** - Auto-sync approved templates from WhatsApp Business Manager
- **🎨 Template Builder** - Visual template creation with header, body, footer, and buttons

### AI-Powered Chatbot
- **🤖 Gemini AI Integration** - Built-in AI assistant for WhatsApp Business API guidance
- **💡 Contextual Help** - Get instant answers about messaging, templates, and best practices

### Authentication & Security
- **🔐 JWT Authentication** - Secure token-based authentication with HTTP-only cookies
- **👤 User Management** - Multi-user support with individual WhatsApp Business accounts
- **🔗 Facebook OAuth** - Optional business login via Facebook for streamlined onboarding

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Browser                              │
├─────────────────────────────────────────────────────────────────────┤
│                    Next.js 14 Frontend (React)                      │
│              Port 3000 | TypeScript | Tailwind CSS                  │
├─────────────────────────────────────────────────────────────────────┤
                              │
                    HTTP/REST │ WebSocket (Socket.IO)
                              │
├─────────────────────────────────────────────────────────────────────┤
│                     FastAPI Backend (Python)                        │
│                Port 8000 | Async | Pydantic Models                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────────────┤
│   Auth   │ Messages │Templates │Broadcasts│  Contacts  │  Chatbot  │
├──────────┴──────────┴──────────┴──────────┴─────────────────────────┤
│                     MongoDB (Database Layer)                        │
├─────────────────────────────────────────────────────────────────────┤
                              │
                    HTTPS API │ Webhooks
                              │
├─────────────────────────────────────────────────────────────────────┤
│                    WhatsApp Cloud API (Meta)                        │
│                         API Version v20.0                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Real-time Communication Flow

```
User sends message in Inbox
         │
         ▼
Frontend emits via Socket.IO ──────► Backend processes & stores
         │                                    │
         │                                    ▼
         │                          Sends to WhatsApp API
         │                                    │
         ▼                                    ▼
UI updates instantly ◄──────────── WhatsApp delivers message
         │
         │ (When recipient replies)
         ▼
WhatsApp Webhook ──► Backend receives ──► Socket.IO emits ──► UI updates
```

---

## 📋 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v18+ | For Next.js frontend |
| Python | v3.9+ | For FastAPI backend |
| MongoDB | v6.0+ | Database (local or Atlas) |
| WhatsApp Business Account | - | Via Meta Business Suite |
| Meta Developer App | - | For Cloud API access |

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# ═══════════════════════════════════════════════════════════════════
# WhatsApp Cloud API Configuration
# ═══════════════════════════════════════════════════════════════════
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WABA_ID=your_whatsapp_business_account_id
WHATSAPP_APP_ID=your_meta_app_id
WHATSAPP_APP_SECRET=your_meta_app_secret
WHATSAPP_API_VERSION=v20.0
VERIFY_TOKEN=your_webhook_verify_token

# ═══════════════════════════════════════════════════════════════════
# Meta Business Configuration
# ═══════════════════════════════════════════════════════════════════
META_BUSINESS_ID=your_meta_business_id
META_API_VERSION=v21.0

# ═══════════════════════════════════════════════════════════════════
# Database Configuration
# ═══════════════════════════════════════════════════════════════════
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=swalay

# ═══════════════════════════════════════════════════════════════════
# JWT Authentication
# ═══════════════════════════════════════════════════════════════════
JWT_SECRET_KEY=your_super_secret_jwt_key_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN_MINUTES=600

# ═══════════════════════════════════════════════════════════════════
# Cookie Settings (adjust for your environment)
# ═══════════════════════════════════════════════════════════════════
# For local development: COOKIE_SECURE=false, COOKIE_SAMESITE=lax
# For HTTPS/production:  COOKIE_SECURE=true, COOKIE_SAMESITE=none
COOKIE_SECURE=true
COOKIE_SAMESITE=none

# ═══════════════════════════════════════════════════════════════════
# CORS Configuration
# ═══════════════════════════════════════════════════════════════════
FRONTEND_ORIGIN=http://localhost:3000

# ═══════════════════════════════════════════════════════════════════
# Facebook OAuth (Optional - for business login)
# ═══════════════════════════════════════════════════════════════════
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/onboarding/whatsapp

# ═══════════════════════════════════════════════════════════════════
# AI Chatbot (Optional - for Gemini AI assistant)
# ═══════════════════════════════════════════════════════════════════
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend Environment Variables

Create a `.env.local` file in the `Frontend/` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

---

## 🚀 Quick Start

### Option 1: Run Both Services (Recommended)

Open two terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server with Socket.IO
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd Frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

### Option 2: Using Batch Scripts (Windows)

```bash
# Terminal 1 - Backend
cd Backend
start_backend.bat

# Terminal 2 - Frontend
cd Frontend
install_deps.bat  # First time only
npm run dev
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js web application |
| Backend API | http://localhost:8000 | FastAPI REST endpoints |
| API Docs | http://localhost:8000/docs | Swagger/OpenAPI documentation |
| Health Check | http://localhost:8000/health | Backend health status |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login user |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/logout` | Logout user |
| `POST` | `/auth/facebook-login` | Facebook OAuth login |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/messages/send` | Send text message |
| `GET` | `/messages/chats` | Get all chats |
| `GET` | `/messages/chats/{chatId}` | Get messages for a chat |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/templates` | List all templates |
| `POST` | `/templates/send` | Send template message |
| `POST` | `/templates/sync` | Sync templates from Meta |
| `POST` | `/templates/create` | Create new template |

### Broadcasts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/broadcasts` | List all broadcasts |
| `POST` | `/broadcasts` | Create and send broadcast |
| `GET` | `/broadcasts/{id}` | Get broadcast details |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contacts` | List all contacts |
| `POST` | `/contacts` | Create contact |
| `PUT` | `/contacts/{id}` | Update contact |
| `DELETE` | `/contacts/{id}` | Delete contact |

### Contact Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contact-lists` | List all contact lists |
| `POST` | `/contact-lists` | Create contact list |
| `PUT` | `/contact-lists/{id}` | Update contact list |

### Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/webhook` | Webhook verification (Meta) |
| `POST` | `/webhook` | Receive WhatsApp events |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chatbot/chat` | Send message to AI chatbot |
| `GET` | `/chatbot/health` | Check chatbot service status |

---

## 🔌 WebSocket Events

The application uses Socket.IO for real-time bidirectional communication.

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `register` | `{ userId: string }` | Register user for real-time updates |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `registered` | `{ userId: string }` | Confirmation of registration |
| `new_message` | `Message object` | New incoming message received |
| `message_status` | `{ messageId, status }` | Message delivery status update |

### Connection Example

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

socket.on('connect', () => {
  socket.emit('register', { userId: 'user-123' });
});

socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

---

## 🔧 Webhook Configuration

To receive incoming WhatsApp messages, configure your Meta App webhook:

1. **Callback URL:** `https://your-domain.com/webhook`
2. **Verify Token:** Same as `VERIFY_TOKEN` in your `.env`
3. **Webhook Fields:** Subscribe to `messages` and `message_status`

### Local Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel to backend
ngrok http 8000

# Use the ngrok URL as your webhook callback URL
# Example: https://abc123.ngrok.io/webhook
```

---

## 🧪 Development Commands

### Backend

```bash
cd Backend

# Start development server with hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run with specific log level
uvicorn main:app --reload --log-level debug

# Production mode (with workers)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend

```bash
cd Frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## 📁 Project Structure

```
Swalay_pabbly/
├── Backend/
│   ├── main.py              # FastAPI app entry point with Socket.IO
│   ├── config.py            # Environment settings (Pydantic)
│   ├── models.py            # Pydantic request/response models
│   ├── requirements.txt     # Python dependencies
│   └── app/
│       ├── api/routes/      # API route handlers
│       │   ├── auth.py      # Authentication endpoints
│       │   ├── broadcasts.py # Broadcast campaign endpoints
│       │   ├── chatbot.py   # AI chatbot endpoints
│       │   ├── contacts.py  # Contact management
│       │   ├── messages.py  # Message sending/receiving
│       │   ├── templates.py # Template management
│       │   └── webhook.py   # WhatsApp webhook handler
│       ├── core/
│       │   └── security.py  # JWT auth & password hashing
│       ├── db/
│       │   └── mongo.py     # MongoDB connection manager
│       ├── services/
│       │   ├── gemini.py    # Google Gemini AI service
│       │   ├── templates.py # Template message service
│       │   └── users.py     # User service
│       └── sockets.py       # Socket.IO event handlers
│
├── Frontend/
│   ├── package.json         # Node.js dependencies
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── middleware.ts        # Next.js middleware (auth)
│   └── src/
│       ├── api/             # API client functions
│       ├── app/             # Next.js App Router pages
│       │   ├── inbox/       # Real-time chat interface
│       │   ├── broadcast/   # Campaign management
│       │   ├── templates/   # Template management
│       │   ├── contacts/    # Contact management
│       │   └── ...
│       ├── components/      # React components
│       │   ├── ui/          # Base UI components
│       │   ├── layout/      # Layout components
│       │   ├── chatbot/     # AI chatbot component
│       │   └── ...
│       ├── hooks/           # Custom React hooks
│       │   ├── useWebSocketMessages.ts
│       │   └── useFacebookSDK.ts
│       └── lib/
│           ├── socketService.ts  # Socket.IO client
│           └── utils.ts          # Utility functions
│
└── README.md
```

---

## 🔒 Security Considerations

- **JWT tokens** are stored in HTTP-only cookies to prevent XSS attacks
- **CORS** is configured to allow only specified origins
- **Password hashing** uses bcrypt with salt
- **Environment variables** keep secrets out of code
- **Input validation** via Pydantic models on all endpoints

---

## 📚 Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Suite](https://business.facebook.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  Built with ❤️ using Next.js, FastAPI, and WhatsApp Cloud API
</p>
