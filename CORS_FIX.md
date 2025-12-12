# CORS Fix - API Proxy Implementation

## Problem
Error "Failed to fetch" terjadi karena client-side fetch ke external API terhalang oleh CORS (Cross-Origin Resource Sharing) policy.

## Solution
Implementasi **API Routes sebagai Proxy** di Next.js untuk bypass CORS issue.

## Architecture

### Before (Direct Fetch - CORS Error)
```
Browser (Client)
    ↓ (CORS blocked)
External API (pasarlama.raymondbt.my.id)
```

### After (Proxy Pattern - Working)
```
Browser (Client)
    ↓ (same origin - OK)
Next.js API Route (/api/external/*)
    ↓ (server-side fetch - OK)
External API (pasarlama.raymondbt.my.id)
```

## Changes Made

### 1. Created API Proxy Routes

#### `/app/api/external/tables/route.ts`
- Proxy untuk Tables API
- Server-side fetch ke `https://pasarlama.raymondbt.my.id/api/tables`
- Error handling & logging

#### `/app/api/external/transactions/route.ts`
- Proxy untuk Transactions API
- Server-side fetch ke `https://pasarlama.raymondbt.my.id/api/transactions`
- Error handling & logging

### 2. Updated Service Functions

#### `lib/api/tables.ts`
```typescript
// Before
const API_BASE_URL = 'https://pasarlama.raymondbt.my.id/api';

// After
const API_BASE_URL = '/api/external';
```

#### `lib/api/transactions.ts`
```typescript
// Before
const API_BASE_URL = 'https://pasarlama.raymondbt.my.id/api';

// After
const API_BASE_URL = '/api/external';
```

## How It Works

1. **Client makes request** to internal API route:
   ```typescript
   fetch('/api/external/tables')
   ```

2. **Next.js API route** (server-side) fetches from external API:
   ```typescript
   fetch('https://pasarlama.raymondbt.my.id/api/tables')
   ```

3. **API route returns data** to client:
   ```typescript
   return NextResponse.json(data)
   ```

## Benefits

✅ **Bypasses CORS** - Same-origin requests dari client  
✅ **Server-side execution** - Fetch happens on server  
✅ **Better security** - API keys bisa disimpan di server  
✅ **Error handling** - Centralized error handling di proxy  
✅ **Caching control** - Bisa implement caching strategy  
✅ **Rate limiting** - Bisa implement rate limiting di proxy  

## Testing

### Test API Routes Directly

```bash
# Test tables endpoint
curl http://localhost:3000/api/external/tables

# Test transactions endpoint
curl http://localhost:3000/api/external/transactions
```

### Expected Response
```json
{
  "success": true,
  "count": 50,
  "data": [...],
  "timestamp": "2025-12-12T..."
}
```

## Error Handling

Jika external API down atau error, proxy akan return:

```json
{
  "success": false,
  "error": "Failed to fetch tables data",
  "message": "External API error: 500 Internal Server Error"
}
```

## Future Improvements

1. **Caching Layer**
   ```typescript
   // Implement simple cache
   const cache = new Map();
   const CACHE_TTL = 5000; // 5 seconds
   ```

2. **Rate Limiting**
   ```typescript
   // Limit requests per IP
   import { rateLimit } from '@/lib/rate-limit';
   ```

3. **Request Logging**
   ```typescript
   // Log all requests for monitoring
   console.log(`[${new Date().toISOString()}] GET ${url}`);
   ```

4. **Environment Variables**
   ```typescript
   const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;
   ```

## Troubleshooting

### Issue: Still getting CORS error
**Solution**: Make sure you're using `/api/external/*` not direct external URL

### Issue: 500 Internal Server Error
**Solution**: Check if external API is accessible from server
```bash
curl https://pasarlama.raymondbt.my.id/api/tables
```

### Issue: Slow response
**Solution**: Implement caching or check external API performance

## Notes

- API routes run on **server-side** (Node.js environment)
- No CORS issues karena request dari server ke server
- Client hanya fetch ke same-origin (`/api/external/*`)
- Best practice untuk production applications

---

**Status**: ✅ Fixed
**Date**: December 12, 2025
