# Sparkfined Frontend (Vercel)

## Alerts & Push Notifications Proxy

To keep the Backend API Key secret, the frontend communicates with the Railway backend via Vercel Serverless Functions (Proxy Layer).

### Required Environment Variables (Vercel Project Settings)
The browser MUST NOT see these. Set them in Vercel Dashboard -> Settings -> Environment Variables.

```bash
RAILWAY_ALERTS_URL=https://<your-railway-service>.up.railway.app
ALERTS_API_KEY=<your-backend-api-key>
# Optional: expose to frontend build or via /api/alerts/vapidPublicKey
VITE_VAPID_PUBLIC_KEY=<your-vapid-public-key>
```

### Proxy Endpoints

These endpoints are deployed at `/api/alerts/*` on Vercel (same origin as frontend).

1. **GET /api/alerts/events**
   - Query: `userId`, `since` (optional), `limit` (optional)
   - Returns: JSON list of events.
   
2. **GET /api/alerts/stream** (SSE)
   - Query: `userId`
   - Returns: `text/event-stream`
   - Note: Proxies the Railway SSE stream. Handles keep-alive and buffering automatically.

3. **POST /api/alerts/push/subscribe**
   - Body: `{ userId, deviceId, subscription, ... }`
   - Proxies to backend to save push subscription.

4. **POST /api/alerts/push/unsubscribe**
   - Body: `{ userId, deviceId }`

### Testing

**Stream (SSE):**
```bash
# Verify stream is working (should hang and print events)
curl -N "https://<your-vercel-domain>/api/alerts/stream?userId=test-user"
```

**Events:**
```bash
curl "https://<your-vercel-domain>/api/alerts/events?userId=test-user"
```

**Push Subscribe:**
```bash
curl -X POST "https://<your-vercel-domain>/api/alerts/push/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","deviceId":"d1","subscription":{...}}'
```

