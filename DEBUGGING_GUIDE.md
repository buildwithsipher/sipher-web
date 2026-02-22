# Debugging Guide: 405/406 Errors on `/api/waitlist`

## Understanding the Errors

### HTTP 405 (Method Not Allowed)
- **Meaning**: The server doesn't support the HTTP method being used (POST in this case)
- **Common Causes**:
  1. Route handler not exported correctly
  2. Route file not being recognized by Next.js
  3. Middleware intercepting and blocking the request
  4. Runtime error preventing route from loading

### HTTP 406 (Not Acceptable)
- **Meaning**: The server cannot produce a response matching the Accept header
- **Common Causes**:
  1. Missing or incorrect `Accept` header
  2. Content-Type mismatch
  3. Server not configured to return JSON

## What We Fixed

### 1. Added OPTIONS Handler for CORS
```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 2. Explicit Content-Type and Accept Headers
All responses now include:
- `Content-Type: application/json`
- `Accept: application/json`

### 3. Enhanced Error Handling
- Content-Type validation before parsing
- Better JSON parsing error handling
- Detailed error logging with `[Waitlist API]` prefix

### 4. Frontend Debugging
Added comprehensive logging in the frontend:
- Request details before sending
- Response status and headers
- Response body parsing with error handling

## Professional Debugging Steps

### Step 1: Check Server Logs
Look for logs prefixed with `[Waitlist API]` in your terminal/console:
```bash
# In development, check your Next.js dev server output
npm run dev
```

Look for:
- `[Waitlist API] POST request received` - confirms route is being hit
- `[Waitlist API] Invalid content type` - content-type issues
- `[Waitlist API] JSON parse error` - malformed request body
- `[Waitlist API] Insert error` - database issues

### Step 2: Check Browser Console
Open DevTools → Console and look for:
- `[Waitlist] Submitting request` - confirms frontend is sending
- `[Waitlist] Response status` - shows HTTP status code
- `[Waitlist] Response headers` - shows response headers
- `[Waitlist] Response body` - shows actual response

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Filter by `/api/waitlist`
3. Click on the failed request
4. Check:
   - **Request Headers**: Should include `Content-Type: application/json` and `Accept: application/json`
   - **Request Payload**: Should be valid JSON
   - **Response Headers**: Check what the server is returning
   - **Response**: Check the actual error message

### Step 4: Verify Route File Structure
Ensure `src/app/api/waitlist/route.ts`:
- ✅ Exports `POST` function
- ✅ Has proper imports
- ✅ No syntax errors
- ✅ File is saved and Next.js has reloaded

### Step 5: Test the Route Directly
Use curl or Postman to test:

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Step 6: Check Middleware
Verify `middleware.ts` isn't blocking the route:
- Check if `/api/waitlist` matches the matcher pattern
- Ensure middleware isn't redirecting API routes

### Step 7: Check Environment Variables
Ensure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (for emails)

### Step 8: Check Database Connection
Verify Supabase connection:
- Check if `createAdminClient()` is working
- Verify database table `waitlist_users` exists
- Check RLS policies if applicable

## Common Issues & Solutions

### Issue: Route returns 405
**Solution**: 
1. Restart Next.js dev server
2. Clear `.next` cache: `rm -rf .next`
3. Verify route file exports `POST` function
4. Check for TypeScript compilation errors

### Issue: Route returns 406
**Solution**:
1. Ensure request includes `Accept: application/json` header
2. Verify server returns `Content-Type: application/json`
3. Check middleware isn't modifying headers

### Issue: Route returns 500
**Solution**:
1. Check server logs for detailed error
2. Verify environment variables are set
3. Check database connection
4. Verify Supabase service role key is correct

### Issue: CORS errors
**Solution**:
1. OPTIONS handler is now included
2. Verify CORS headers in response
3. Check if request is from same origin (shouldn't need CORS for same-origin)

## Testing Checklist

- [ ] Route file exists at `src/app/api/waitlist/route.ts`
- [ ] Route exports `POST` function
- [ ] No TypeScript errors
- [ ] Next.js dev server is running
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] Request includes proper headers
- [ ] Response includes proper headers
- [ ] Console logs show request/response details

## Next Steps

1. **Restart your dev server** to ensure changes are loaded
2. **Clear browser cache** or use incognito mode
3. **Check the console logs** for detailed error messages
4. **Test with curl/Postman** to isolate frontend vs backend issues
5. **Check server logs** for backend errors

## Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
