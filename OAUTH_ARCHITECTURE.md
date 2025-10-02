# OAuth Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         SAGE App                             │
│  (GitHub Pages / Static Hosting)                            │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  index.html  │  │   auth.js    │  │   main.js    │      │
│  │              │  │              │  │              │      │
│  │ [Sign In]    │←→│ AuthManager  │←→│ API Routing  │      │
│  │ [User Info]  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬──────────────────────────┬─────────────┘
                     │                          │
                     │ ① Auth Request           │ ④ API Request
                     │ ③ Session Token          │    (with token)
                     │                          │
                     ↓                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Worker                               │
│         (OAuth + API Proxy)                                  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /auth/*    │  │  /api/gen    │  │ Session Mgmt │      │
│  │              │  │              │  │              │      │
│  │ OAuth Flow   │  │ Proxy to     │  │ JWT Tokens   │      │
│  │              │  │ Gemini API   │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                  │                                 │
└─────────┼──────────────────┼─────────────────────────────────┘
          │                  │
          │ ② OAuth          │ ⑤ API Call
          │    Handshake     │    (with API key)
          │                  │
          ↓                  ↓
┌──────────────────┐  ┌──────────────────┐
│  Google OAuth    │  │   Gemini API     │
│                  │  │                  │
│ accounts.google  │  │ generativelang.. │
│ .com             │  │ .googleapis.com  │
└──────────────────┘  └──────────────────┘
```

## Authentication Flow (Detailed)

```
User                    SAGE App              Worker              Google
│                          │                     │                   │
│ 1. Click "Sign In"       │                     │                   │
├─────────────────────────→│                     │                   │
│                          │                     │                   │
│                          │ 2. GET /auth/google │                   │
│                          ├────────────────────→│                   │
│                          │                     │                   │
│                          │ 3. 302 Redirect     │                   │
│                          │←────────────────────┤                   │
│                          │                     │                   │
│ 4. Redirect to Google OAuth                    │                   │
├───────────────────────────────────────────────────────────────────→│
│                          │                     │                   │
│ 5. Enter credentials     │                     │                   │
├─────────────────────────────────────────────────────────────────→ │
│                          │                     │                   │
│ 6. Authorize SAGE        │                     │                   │
├─────────────────────────────────────────────────────────────────→ │
│                          │                     │                   │
│ 7. Callback with auth code                    │                   │
│←──────────────────────────────────────────────┤                   │
│                          │                     │                   │
│                          │ 8. Exchange code    │                   │
│                          │    for tokens       │                   │
│                          │                     ├──────────────────→│
│                          │                     │                   │
│                          │                     │ 9. ID Token       │
│                          │                     │←──────────────────┤
│                          │                     │                   │
│                          │                     │ 10. Verify domain │
│                          │                     │    (@yourdomain)  │
│                          │                     │                   │
│                          │ 11. Session Token   │                   │
│                          │    (JWT, 24h)       │                   │
│                          │←────────────────────┤                   │
│                          │                     │                   │
│ 12. Redirect to app      │                     │                   │
│    with token            │                     │                   │
│←─────────────────────────┤                     │                   │
│                          │                     │                   │
│ 13. Store session token  │                     │                   │
│    (sessionStorage)      │                     │                   │
│                          │                     │                   │
│ ✅ User is authenticated │                     │                   │
```

## API Request Flow (After Authentication)

```
User                    SAGE App              Worker              Gemini API
│                          │                     │                   │
│ 1. Generate questions    │                     │                   │
├─────────────────────────→│                     │                   │
│                          │                     │                   │
│                          │ 2. POST /api/generate                   │
│                          │    + Session Token  │                   │
│                          ├────────────────────→│                   │
│                          │                     │                   │
│                          │                     │ 3. Verify token   │
│                          │                     │    signature      │
│                          │                     │                   │
│                          │                     │ 4. Check domain   │
│                          │                     │                   │
│                          │                     │ 5. Check expiry   │
│                          │                     │                   │
│                          │                     │ 6. POST with API  │
│                          │                     │    key (server)   │
│                          │                     ├──────────────────→│
│                          │                     │                   │
│                          │                     │ 7. Questions JSON │
│                          │                     │←──────────────────┤
│                          │                     │                   │
│                          │ 8. Proxy response   │                   │
│                          │←────────────────────┤                   │
│                          │                     │                   │
│ 9. Display questions     │                     │                   │
│←─────────────────────────┤                     │                   │
│                          │                     │                   │
│ ✅ Questions generated   │                     │                   │
```

## Fallback to API Key Mode

```
User                    SAGE App              Gemini API
│                          │                   │
│ 1. Enter API key         │                   │
├─────────────────────────→│                   │
│                          │                   │
│ 2. Save to localStorage  │                   │
│                          │                   │
│ 3. Generate questions    │                   │
├─────────────────────────→│                   │
│                          │                   │
│                          │ 4. Direct POST    │
│                          │    with user's    │
│                          │    API key        │
│                          ├──────────────────→│
│                          │                   │
│                          │ 5. Questions JSON │
│                          │←──────────────────┤
│                          │                   │
│ 6. Display questions     │                   │
│←─────────────────────────┤                   │
│                          │                   │
│ ✅ Questions generated   │                   │

Note: Worker is bypassed entirely in this mode
```

## Data Flow

### Session Token (JWT) Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "email": "user@yourdomain.com",
    "name": "User Name",
    "picture": "https://...",
    "hd": "yourdomain.com",
    "iat": 1234567890,
    "exp": 1234654290
  },
  "signature": "HMAC-SHA256(header.payload, JWT_SECRET)"
}
```

### API Request Payload

```json
{
  "model": "flash",
  "payload": {
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "Generate 3 math problems..." }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json",
      "responseSchema": { ... }
    }
  }
}
```

## Security Layers

```
┌────────────────────────────────────────────┐
│         Security Layer 1: OAuth            │
│  - Domain restriction (@yourdomain.com)    │
│  - Google validates user identity          │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│      Security Layer 2: JWT Tokens          │
│  - Signed with HMAC-SHA256                 │
│  - Includes domain verification            │
│  - 24-hour expiration                      │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│    Security Layer 3: Worker Validation     │
│  - Verify signature on every request       │
│  - Check token expiration                  │
│  - Verify domain matches workspace         │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│   Security Layer 4: API Key Protection     │
│  - Stored as Cloudflare secret (encrypted) │
│  - Never exposed to client                 │
│  - Only accessed by authenticated workers  │
└────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Development                         │
│                                                  │
│  Local Files → Git → GitHub                     │
└─────────────────┬───────────────────────────────┘
                  │
                  │ git push
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│           GitHub Repository                      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  SAGE    │  │  Worker  │  │   Docs   │      │
│  │  App     │  │  Code    │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└────────┬──────────────────────────┬─────────────┘
         │                          │
         │ Auto-deploy              │ wrangler deploy
         │ (GitHub Pages)           │
         │                          │
         ↓                          ↓
┌──────────────────┐      ┌──────────────────┐
│  GitHub Pages    │      │  Cloudflare      │
│                  │      │  Workers         │
│  SAGE App        │      │                  │
│  (Static HTML)   │      │  OAuth + Proxy   │
└──────────────────┘      └──────────────────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    │ Users access
                    │
                    ↓
              ┌──────────┐
              │  Users   │
              │          │
              │ Browser  │
              └──────────┘
```

## Cost Architecture

```
┌────────────────────────────────────────┐
│         Free Tier Coverage             │
│                                        │
│  Cloudflare Workers                    │
│  ├─ 100,000 requests/day               │
│  ├─ 1GB Workers KV storage             │
│  └─ 10ms CPU time per request          │
│                                        │
│  GitHub Pages                          │
│  ├─ 100GB bandwidth/month              │
│  ├─ Unlimited static hosting           │
│  └─ Auto SSL certificates              │
│                                        │
│  Google OAuth                          │
│  └─ Free (unlimited)                   │
└────────────────────────────────────────┘

Typical Team Usage (10 users):
├─ ~200-500 requests/day
├─ ~5-15 KB per request
└─ Total: Well within free tier
```

## File Organization

```
sage-generator/
├── index.html (OAuth UI added, hidden by default)
├── auth-callback.html (OAuth callback handler)
│
├── js/
│   ├── auth.js (NEW - OAuth client)
│   ├── config.js (Updated - OAuth config)
│   └── main.js (Updated - OAuth initialization)
│
├── css/
│   └── oauth.css (NEW - OAuth UI styles)
│
├── worker/ (NEW)
│   ├── index.js (OAuth + API proxy)
│   ├── wrangler.toml (Configuration)
│   ├── package.json (Metadata)
│   └── README.md (Technical docs)
│
└── docs/
    ├── OAUTH_QUICKSTART.md (30-min guide)
    ├── OAUTH_SETUP.md (Detailed guide)
    ├── OAUTH_SUMMARY.md (Overview)
    └── OAUTH_ARCHITECTURE.md (This file)
```

## State Machine

```
┌─────────────┐
│   Start     │
│ (No Auth)   │
└──────┬──────┘
       │
       │ User action
       │
       ↓
┌─────────────────────────┐
│   Authentication        │
│   Selection             │
└───┬─────────────────┬───┘
    │                 │
    │ OAuth           │ API Key
    │                 │
    ↓                 ↓
┌───────────┐    ┌──────────┐
│  Sign In  │    │  Enter   │
│  with     │    │  API Key │
│  Google   │    │          │
└─────┬─────┘    └────┬─────┘
      │               │
      │ Success       │ Success
      │               │
      ↓               ↓
┌──────────────────────────┐
│   Authenticated          │
│   (Can generate Qs)      │
└───────────┬──────────────┘
            │
            │ Session expires
            │ or Sign Out
            │
            ↓
      ┌──────────┐
      │  Return  │
      │  to      │
      │  Start   │
      └──────────┘
```

---

**This architecture provides:**
- ✅ Separation of concerns
- ✅ Security through multiple layers
- ✅ Scalability (serverless)
- ✅ Cost efficiency (free tier)
- ✅ Easy rollback (config flag)
- ✅ Backward compatibility
