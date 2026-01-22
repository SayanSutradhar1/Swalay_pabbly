# Facebook Login for Business - OAuth Implementation Guide

## Overview

This document describes the implementation of Facebook Login for Business (not consumer Facebook Login) using the OAuth 2.0 authorization code flow with business-specific scopes.

## Changes Made

### 1. **Frontend Configuration** 

#### Environment Variables Required

Add these to your `.env.local`:

```
NEXT_PUBLIC_META_APP_ID=<your-meta-app-id>
NEXT_PUBLIC_FACEBOOK_REDIRECT_URI=<your-redirect-uri>
NEXT_PUBLIC_META_API_VERSION=v21.0
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Important**: The `NEXT_PUBLIC_FACEBOOK_REDIRECT_URI` must **exactly match** the redirect URI configured in your Meta/Facebook App Dashboard.

Example redirect URIs:
- Development: `http://localhost:3000/login`
- Production: `https://yourdomain.com/login`

---

### 2. **Frontend Changes**

#### `useFacebookSDK.ts` Hook

**Removed:**
- `FB.login()` method (consumer Facebook login)
- Consumer scopes: `email`, `public_profile`

**Added:**
- `getAuthorizationUrl()` method that generates OAuth authorization URL
- Business scopes: `business_management`, `whatsapp_business_management`
- OAuth authorization code flow (not access token flow)
- State parameter for security

**How it works:**
```typescript
const authUrl = getAuthorizationUrl();
// Redirects to: https://www.facebook.com/v21.0/dialog/oauth?
//   client_id=...
//   redirect_uri=...
//   scope=business_management,whatsapp_business_management
//   response_type=code
//   state=...
```

#### `FacebookLoginButton.tsx`

**Changes:**
- Listens for OAuth callback URL parameters (`code`, `error`)
- Exchanges authorization code with backend endpoint `/auth/facebook/callback`
- Handles redirect after successful authentication
- No longer uses direct FB SDK login with access tokens

**Flow:**
1. User clicks "Continue with Facebook Business"
2. Redirected to Facebook authorization dialog
3. User grants business permissions
4. Facebook redirects back to `NEXT_PUBLIC_FACEBOOK_REDIRECT_URI` with `code` parameter
5. Frontend exchanges code with backend
6. User is logged in and redirected to dashboard

---

### 3. **Backend Changes**

#### `config.py` - New Configuration

Added Facebook OAuth settings:

```python
FACEBOOK_APP_ID: str
FACEBOOK_APP_SECRET: str
FACEBOOK_REDIRECT_URI: str
META_API_VERSION: str = "v21.0"
```

**Required Environment Variables:**

```
FACEBOOK_APP_ID=<your-app-id>
FACEBOOK_APP_SECRET=<your-app-secret>
FACEBOOK_REDIRECT_URI=<exactly-matches-dashboard-config>
```

#### `auth.py` - New OAuth Callback Endpoint

**Removed:**
- Old `/auth/facebook` POST endpoint
- Dependency on `FacebookLoginRequest` model
- Email requirement from Facebook

**Added:**
- New `/auth/facebook/callback` POST endpoint
- Authorization code exchange flow

**Endpoint Details:**

```
POST /auth/facebook/callback

Request Body:
{
  "code": "authorization_code_from_facebook",
  "state": "state_parameter_for_security" (optional)
}

Response:
{
  "access_token": "jwt_token_for_swalay_app",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "business_<facebook_id>@swalay.local",
    "created_at": "ISO_timestamp"
  }
}
```

**Authentication Flow:**

1. **Exchange Authorization Code for Access Token**
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
   Params:
     - client_id: Your Meta App ID
     - client_secret: Your Meta App Secret
     - redirect_uri: Must exactly match configured redirect URI
     - code: Authorization code from user
   ```

2. **Get User Information (Business Scopes)**
   ```
   GET https://graph.facebook.com/v21.0/me
   Fields: id, name, business_management
   ```
   
   **Note:** Email is NOT available with business scopes. User email is generated as:
   `business_<facebook_id>@swalay.local`

3. **Create/Update User in Database**
   - Find user by `facebook_id`
   - If new user: create with generated email and `login_type: facebook_business`
   - If existing: update `last_login` timestamp

4. **Generate Swalay Application Token**
   - Create JWT token for internal session management
   - Set authentication cookie
   - Return user info

---

## Security Considerations

### 1. **Redirect URI Matching**
- **CRITICAL**: The `redirect_uri` parameter in the OAuth flow must **exactly match** what's configured in:
  - Meta App Dashboard
  - `FACEBOOK_REDIRECT_URI` environment variable
  - `getAuthorizationUrl()` in frontend
  - Backend verification

### 2. **State Parameter**
- Frontend generates random state for CSRF protection
- While optional in this implementation, it's recommended to validate state in production

### 3. **Scopes**
- Using business scopes means:
  - No consumer personal data (email, public profile)
  - Designed for business/app integrations
  - Fewer permissions = better security

### 4. **Token Security**
- Authorization code is short-lived (expires after few minutes)
- Access token exchange happens server-to-server
- Frontend never sees Facebook access token
- Swalay app issues its own JWT for session management

---

## Environment Configuration Examples

### Development (.env.local)
```
NEXT_PUBLIC_META_APP_ID=123456789
NEXT_PUBLIC_FACEBOOK_REDIRECT_URI=http://localhost:3000/login
NEXT_PUBLIC_META_API_VERSION=v21.0
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
FACEBOOK_APP_ID=123456789
FACEBOOK_APP_SECRET=abc_secret_key_xyz
FACEBOOK_REDIRECT_URI=http://localhost:3000/login
META_API_VERSION=v21.0

# Existing settings
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_APP_ID=...
WHATSAPP_APP_SECRET=...
# ... other settings
```

---

## Testing the Flow

### Step 1: Configure Meta App Dashboard
1. Go to [Meta Developers Dashboard](https://developers.facebook.com)
2. Select your app
3. Go to **Settings > Basic** to get App ID and Secret
4. Go to **Products > Facebook Login > Settings**
5. Add Redirect URI: `http://localhost:3000/login` (for development)
6. Valid OAuth Redirect URIs should include your redirect_uri

### Step 2: Set Environment Variables
- Frontend: `.env.local`
- Backend: `.env`

### Step 3: Test OAuth Flow
1. Start backend: `python Backend/main.py`
2. Start frontend: `npm run dev` in Frontend/
3. Go to http://localhost:3000/login
4. Click "Continue with Facebook Business"
5. Complete Facebook authorization
6. Should redirect to dashboard on success

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `redirect_uri_mismatch` | Redirect URI doesn't match dashboard config | Verify exact match in all three places |
| `Invalid Scopes: email` | Requesting consumer scopes with business login | Use only: `business_management`, `whatsapp_business_management` |
| `invalid code` | Authorization code expired or invalid | Code expires in ~10 minutes, retry |
| `Invalid OAuth Token` | Token exchange failed | Check App ID and Secret are correct |
| `Failed to retrieve Facebook user ID` | User info endpoint issue | Verify scopes and token are valid |

---

## Migration Notes

If migrating from consumer Facebook Login:

1. **Remove** `FacebookLoginRequest` model imports if not used elsewhere
2. **Remove** old email-based user lookups for Facebook login
3. **Update** any redirect URLs that referenced `/auth/facebook`
4. **Add** environment variables for OAuth configuration
5. **Test** thoroughly with business account (not consumer account)

---

## Best Practices

1. **Always validate redirect_uri** - It's the #1 cause of OAuth failures
2. **Use environment variables** - Never hardcode credentials
3. **Implement state parameter validation** - For CSRF protection
4. **Log OAuth errors** - For debugging issues
5. **Test with business account** - Not consumer Facebook account
6. **Use HTTPS in production** - OAuth redirect URIs must be HTTPS
7. **Implement token refresh** - If needed for long-lived sessions
8. **Monitor failed authentication** - Track auth errors for debugging

---

## References

- [Facebook Login for Business Documentation](https://developers.facebook.com/docs/facebook-login)
- [OAuth 2.0 Authorization Code Flow](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
- [WhatsApp Business API with Facebook Login](https://developers.facebook.com/docs/whatsapp/business-management-api)
- [Meta Graph API Reference](https://developers.facebook.com/docs/graph-api)
