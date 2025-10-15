# CORS Configuration Guide

## Overview
This document outlines the CORS (Cross-Origin Resource Sharing) configuration for the IMS application edge functions.

**Last Updated**: 2025-10-15  
**Status**: ✅ Production Ready

---

## Allowed Origins

The following origins are whitelisted in all edge functions:

| Environment | Origin URL | Purpose |
|------------|-----------|---------|
| **Production** | `https://preview--ims-darkone-version.lovable.app` | Live production environment |
| **Staging** | `https://ims-darkone-version.lovable.app` | Staging/preview environment |
| **Local Development** | `http://localhost:5173` | Local development server |

---

## Edge Functions with CORS Configuration

All 7 edge functions have consistent CORS settings:

1. `workflow-service`
2. `notification-service`
3. `application-service`
4. `email-service`
5. `user-management`
6. `document-service`
7. `reporting-service`

---

## CORS Headers Configuration

```typescript
const allowedOrigins = [
  'https://preview--ims-darkone-version.lovable.app',
  'https://ims-darkone-version.lovable.app',
  'http://localhost:5173'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': origin, // Dynamically set from allowedOrigins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
};
```

### Key Features:
- ✅ **No wildcard (`*`)** - Strict origin validation
- ✅ **Dynamic origin reflection** - Only allowed origins are reflected
- ✅ **Credentials support** - Enables cookies and auth headers
- ✅ **OPTIONS preflight** - Proper 200 OK response for preflight requests

---

## Adding a New Origin (e.g., Custom Domain)

### Step 1: Update Edge Functions
Edit all 7 edge function files to add the new origin:

```typescript
const allowedOrigins = [
  'https://yourdomain.com',                              // ← ADD HERE
  'https://preview--ims-darkone-version.lovable.app',
  'https://ims-darkone-version.lovable.app',
  'http://localhost:5173'
];
```

**Files to update:**
- `supabase/functions/workflow-service/index.ts`
- `supabase/functions/notification-service/index.ts`
- `supabase/functions/application-service/index.ts`
- `supabase/functions/email-service/index.ts`
- `supabase/functions/user-management/index.ts`
- `supabase/functions/document-service/index.ts`
- `supabase/functions/reporting-service/index.ts`

### Step 2: Update Supabase Auth URLs

**Supabase Dashboard → Authentication → URL Configuration:**

1. **Site URL**: `https://yourdomain.com`
2. **Redirect URLs** (add):
   ```
   https://yourdomain.com/**
   https://preview--ims-darkone-version.lovable.app/**
   https://ims-darkone-version.lovable.app/**
   http://localhost:5173/**
   ```

### Step 3: Deploy Changes
Changes are automatically deployed when you push code to Lovable.

### Step 4: Test Authentication Flow
1. Open `https://yourdomain.com`
2. Sign in with test account
3. Verify redirect works correctly
4. Check console for CORS errors (there should be none)

---

## Troubleshooting

### Issue: CORS Error in Console
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Verify origin is in `allowedOrigins` array (exact match, no trailing slash)
2. Check Supabase Auth Redirect URLs include the origin
3. Clear browser cache and refresh
4. Check edge function logs for errors

### Issue: 401 Unauthorized
**Error**: Edge function returns 401

**Solution**:
1. Verify Supabase Auth Redirect URLs include current domain
2. Check user is signed in (auth token in localStorage)
3. Verify JWT verification is enabled in `supabase/config.toml`

### Issue: Redirect Loop
**Error**: App keeps redirecting to sign-in page

**Solution**:
1. Verify Site URL matches current domain
2. Check auth session is persisting (localStorage)
3. Verify `redirectTo` parameter in sign-in URL

---

## Security Best Practices

✅ **Never use wildcard (`*`)** in production  
✅ **Always validate origin** against allowlist  
✅ **Enable credentials** only when necessary  
✅ **Log rejected origins** for security monitoring  
✅ **Keep allowlist minimal** - only add trusted domains  
✅ **Use HTTPS** for all production origins  

---

## Validation Checklist

Before deploying to production:

- [ ] All edge functions have consistent `allowedOrigins`
- [ ] Supabase Site URL matches production domain
- [ ] All Redirect URLs configured in Supabase Auth
- [ ] No wildcard (`*`) in CORS headers
- [ ] OPTIONS preflight returns 200 OK
- [ ] Credentials enabled (`Access-Control-Allow-Credentials: 'true'`)
- [ ] Test authentication flow on production domain
- [ ] Test edge function calls return 200 OK
- [ ] No CORS errors in browser console

---

## References

- [Supabase Auth Configuration](https://supabase.com/dashboard/project/shwfzxpypygdxoqxutae/auth/url-configuration)
- [Edge Functions Logs](https://supabase.com/dashboard/project/shwfzxpypygdxoqxutae/functions)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Document Status**: ✅ Production Ready  
**Maintained By**: IMS Development Team  
**Review Frequency**: Before each deployment
