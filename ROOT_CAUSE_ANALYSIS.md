# Root Cause Analysis: 405/406 Errors

## Timeline

1. **Initial State (Working)**: Commit `d694fc7` - "Finalizing MVP"
   - ✅ Created 10 users successfully
   - ❌ Route did NOT have `runtime = 'nodejs'` or `dynamic = 'force-dynamic'`
   - ✅ Middleware was running on all routes (including API routes)

2. **First Fix Attempt**: Commit `bca6caf` - "Fix 405 error on waitlist finish button"
   - Added `export const dynamic = 'force-dynamic'`
   - Added `export const runtime = 'nodejs'`
   - Added `Accept` header to requests
   - **Result**: Still broken (405/406 errors)

3. **Second Fix Attempt**: Commit `11d9620` - "Fix 405/406 errors: Add Accept header to CORS"
   - Added `Accept` to CORS allowed headers
   - Added `Content-Type: application/json` to all responses
   - **Result**: Still broken

4. **Third Fix Attempt**: Commit `056b6f0` - "Fix middleware interference with API routes"
   - Middleware now skips API routes
   - **Result**: Unknown (needs testing)

## Root Cause Hypothesis

### **Most Likely**: `runtime = 'nodejs'` Conflict

The `export const runtime = 'nodejs'` was added to fix the 405 error, but it might actually be **causing** the problem:

1. **Next.js 16 Default Behavior**: API routes might default to edge runtime or have different behavior
2. **Middleware Conflict**: Middleware runs on edge runtime, but API route is forced to nodejs
3. **Header Mismatch**: Different runtimes might handle headers differently

### **Alternative Hypothesis**: Middleware Security Headers

The middleware sets CSP and other security headers that might interfere:

- `Content-Security-Policy` with `connect-src 'self'`
- `X-Content-Type-Options: nosniff`
- These headers might conflict with API route responses

## Solution Options

### Option 1: Remove `runtime = 'nodejs'` (Revert to Working State)

```typescript
// Remove these lines:
// export const dynamic = 'force-dynamic'
// export const runtime = 'nodejs'
```

### Option 2: Keep Runtime but Fix Middleware

- Ensure middleware properly handles API routes
- Don't set security headers on API routes

### Option 3: Explicitly Configure for Edge Runtime

```typescript
export const runtime = 'edge'
```

## Recommended Fix

**Try Option 1 first** - Remove the runtime/dynamic exports and see if it works like it did before.

If that doesn't work, then the issue is likely in the middleware's security headers interfering with API routes.
