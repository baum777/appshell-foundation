# Sparkfined Frontend (Vercel)

## Alerts & Push Notifications Proxy

To keep the Backend API Key secret, the frontend communicates with the Railway backend via Vercel Serverless Functions (Proxy Layer).

**The browser NEVER sees the Railway API_KEY.** All requests go through `/api/alerts/*`.

---

## Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**.

> ⚠️ **CRITICAL**: These are server-only secrets. Do NOT prefix with `VITE_` or `NEXT_PUBLIC_`.

| Variable | Required | Description |
|----------|----------|-------------|
| `RAILWAY_ALERTS_URL` | ✅ | Railway backend URL, e.g. `https://<service>.up.railway.app` |
| `ALERTS_API_KEY` | ✅ | Backend API key for server-to-server authentication |
| `VITE_VAPID_PUBLIC_KEY` | ⚪ | VAPID public key for Web Push (can also use `/api/alerts/vapidPublicKey` endpoint) |

---

## Proxy Endpoints

All endpoints are deployed at `/api/alerts/*` on Vercel (same origin as frontend, no CORS needed).

### 1. GET /api/alerts/events

Fetches historical alert events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | User identifier |
| `since` | ISO 8601 | ⚪ | Fetch events after this timestamp |
| `limit` | number | ⚪ | Max events to return (default: 200, max: 500) |

**Response:** JSON array of events from backend.

### 2. GET /api/alerts/stream (SSE)

Server-Sent Events stream for real-time alerts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | User identifier |

**Response Headers:**
- `Content-Type: text/event-stream; charset=utf-8`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`

**SSE Caveats on Vercel:**
- Vercel Serverless Functions have a max execution time (10s hobby, 60s pro, 900s enterprise)
- For long-lived connections, consider upgrading plan or implementing reconnection logic in frontend
- The proxy handles client disconnect by aborting the upstream request

### 3. POST /api/alerts/push/subscribe

Registers a device for push notifications.

**Request Body:**
```json
{
  "userId": "string (required)",
  "deviceId": "string (required)",
  "subscription": {
    "endpoint": "string (required)",
    "keys": {
      "p256dh": "string (required)",
      "auth": "string (required)"
    }
  },
  "userAgent": "string (optional)"
}
```

**Response:** JSON from backend confirming subscription.

### 4. POST /api/alerts/push/unsubscribe

Removes a device from push notifications.

**Request Body:**
```json
{
  "userId": "string (required)",
  "deviceId": "string (required)"
}
```

**Response:** JSON from backend confirming removal.

### 5. GET /api/alerts/vapidPublicKey

Returns the VAPID public key for Web Push subscription.

**Response:**
```json
{ "publicKey": "BPxxx..." }
```

Returns `404` if not configured.

---

## Frontend Usage

The frontend calls these proxy endpoints instead of Railway directly:

```typescript
// Example: Fetch events
const events = await fetch(`/api/alerts/events?userId=${userId}&limit=100`)
  .then(r => r.json());

// Example: SSE stream
const eventSource = new EventSource(`/api/alerts/stream?userId=${userId}`);
eventSource.onmessage = (e) => console.log(JSON.parse(e.data));

// Example: Subscribe to push
await fetch('/api/alerts/push/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, deviceId, subscription })
});
```

---

## Testing with curl

### Events
```bash
curl "http://localhost:3000/api/alerts/events?userId=test-user"

# With optional parameters
curl "http://localhost:3000/api/alerts/events?userId=test-user&since=2024-01-01T00:00:00Z&limit=50"
```

### SSE Stream
```bash
# -N disables buffering for real-time output
curl -N "http://localhost:3000/api/alerts/stream?userId=test-user"
```

### Push Subscribe
```bash
curl -X POST "http://localhost:3000/api/alerts/push/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "deviceId": "device-abc123",
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/xxx",
      "keys": {
        "p256dh": "BNcRdreALRF...",
        "auth": "tBHIt..."
      }
    },
    "userAgent": "Mozilla/5.0..."
  }'
```

### Push Unsubscribe
```bash
curl -X POST "http://localhost:3000/api/alerts/push/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "deviceId": "device-abc123"
  }'
```

### VAPID Public Key
```bash
curl "http://localhost:3000/api/alerts/vapidPublicKey"
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Protection**
   - `ALERTS_API_KEY` is server-only and must NEVER be exposed as `VITE_*` or `NEXT_PUBLIC_*`
   - The proxy layer ensures the key never reaches the browser

2. **userId Security**
   - The current implementation does NOT authenticate end-users
   - The proxy endpoints are publicly accessible
   - `userId` is passed through without verification
   - **TODO:** Implement proper user authentication (e.g., JWT verification) before production

3. **Rate Limiting**
   - No rate limiting is implemented in the proxy layer
   - Recommend implementing rate limiting in the Railway backend
   - Consider adding Vercel Edge rate limiting for production

4. **Input Validation**
   - Basic input validation is performed at the proxy layer
   - Full validation and sanitization happens at the Railway backend

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Missing or invalid required parameters |
| 405 | Method not allowed (wrong HTTP method) |
| 500 | Configuration error (missing env vars) |
| 502 | Upstream error (Railway backend unreachable or failed) |

---

## File Structure

```
api/
├── _lib/
│   └── alertsProxy.ts    # Shared proxy utilities
└── alerts/
    ├── events.ts         # GET /api/alerts/events
    ├── stream.ts         # GET /api/alerts/stream (SSE)
    ├── vapidPublicKey.ts # GET /api/alerts/vapidPublicKey
    └── push/
        ├── subscribe.ts  # POST /api/alerts/push/subscribe
        └── unsubscribe.ts# POST /api/alerts/push/unsubscribe
```

