# Debug Guide: API Connection Errors

## 🔴 Errors You're Seeing:

```
AuthContext.jsx:53:25  ← fetch() call in login function
AuthPage.jsx:30:24     ← calling login(email, password)
```

These are **network errors** - frontend can't reach backend API.

---

## 🎯 Quick Diagnosis (Do This First!)

### Step 1: Check Backend is Running

**Test URL:** https://resumind-vlu4.onrender.com/api/health

**Expected:** `{"status":"OK","message":"Backend is running!"}`

✅ **If works** → Backend is fine, issue is with frontend connection
❌ **If fails** → Backend is down or not deployed correctly

---

### Step 2: Check What URL Frontend is Calling

1. **Open your app** (localhost:3000 or Vercel URL)
2. **Press F12** → **Console tab**
3. **Try to login with any credentials**
4. **Look at the error message**

**Example error:**
```
Failed to fetch
POST http://localhost:5050/api/auth/login  ← Wrong! Backend not running locally
```

or

```
TypeError: Failed to fetch
POST https://api.resumind.ramadanrexhepi.dev/api/auth/login  ← DNS not set up yet
```

**What the URL should be:**
- Local dev: `http://localhost:5050/api/auth/login` (if backend running locally)
- Local dev: `https://resumind-vlu4.onrender.com/api/auth/login` (using deployed backend)
- Production: `https://api.resumind.ramadanrexhepi.dev/api/auth/login` (after DNS setup)

---

### Step 3: Check Environment Variable

**In browser console (F12 → Console), type:**
```javascript
console.log(process.env.REACT_APP_API_URL)
```

**Should show:**
- `http://localhost:5050` (local with local backend)
- `https://resumind-vlu4.onrender.com` (local with deployed backend)
- `https://api.resumind.ramadanrexhepi.dev` (production with custom domain)

**If shows `undefined`:**
- Environment variable not set
- Need to restart dev server (if testing locally)
- Need to redeploy Vercel (if testing on Vercel)

---

## 🔧 Solutions Based on Where You're Testing:

### **Scenario A: Testing Locally (localhost:3000)**

#### Quick Fix - Use Deployed Backend:

1. **Updated .env.local** (I just did this):
   ```
   REACT_APP_API_URL=https://resumind-vlu4.onrender.com
   ```

2. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm start
   ```

3. **Test login again** - should work!

#### Alternative - Use Local Backend:

1. **Start backend locally:**
   ```bash
   cd backend
   npm start
   ```
   Should see: "Backend server running on http://localhost:5050"

2. **Update .env.local:**
   ```
   REACT_APP_API_URL=http://localhost:5050
   ```

3. **Restart frontend:**
   ```bash
   npm start
   ```

---

### **Scenario B: Testing on Vercel (Production)**

#### Fix - Set Environment Variable:

1. **Vercel Dashboard** → Your Project → **Settings**
2. **Click "Environment Variables"**
3. **Add new variable:**
   ```
   Name:  REACT_APP_API_URL
   Value: https://resumind-vlu4.onrender.com
   ```
4. **Check all environments:** Production, Preview, Development
5. **Save**

6. **CRITICAL:** Go to **Deployments** tab
7. **Click three dots (•••)** on latest deployment
8. **Click "Redeploy"**
9. **Wait 2-3 minutes**

10. **Test again** - should work!

---

## 🔍 Advanced Debugging:

### Check Network Tab:

1. **F12** → **Network tab**
2. **Try to login**
3. **Look for the request** (should be red if failed)
4. **Click on it** to see details:
   - URL being called
   - Status code
   - Response

**Common status codes:**
- **0** or **Failed to fetch** → Can't reach backend at all
- **404** → Wrong URL
- **405** → Method not allowed (POST vs GET issue)
- **500** → Backend error (check Render logs)
- **CORS error** → Backend blocking the request

---

### Check Render Logs:

1. **Render Dashboard** → Your Service
2. **Click "Logs"** tab
3. **Try to login from frontend**
4. **Watch logs** - should see incoming requests

**Good logs:**
```
POST /api/auth/login
✅ User logged in: test@example.com
```

**Bad logs:**
```
⚠️ Blocked by CORS: https://some-unexpected-domain.com
❌ Login error: Email not found
```

---

## 📋 Complete Diagnostic Checklist:

Run through EVERY item:

- [ ] **Backend health endpoint works:** https://resumind-vlu4.onrender.com/api/health
- [ ] **Backend is running:** Check Render dashboard shows "Live"
- [ ] **Check browser console:** F12 → Console → Note exact error message
- [ ] **Check Network tab:** F12 → Network → See failed request details
- [ ] **Check environment variable:**
  - Local: `.env.local` file exists and has correct URL
  - Production: Vercel → Settings → Environment Variables
- [ ] **Restarted/Redeployed:**
  - Local: Stopped and restarted `npm start`
  - Production: Redeployed on Vercel
- [ ] **CORS headers:** Backend should allow your domain (already configured)
- [ ] **Check Render logs:** Any errors when trying to login?

---

## 🐛 Common Issues & Fixes:

### Issue 1: "Failed to fetch" / "Network Error"

**Symptoms:**
- Can't reach backend at all
- Console shows: `TypeError: Failed to fetch`

**Causes & Fixes:**

**A) Backend not running:**
- Test: https://resumind-vlu4.onrender.com/api/health
- Fix: Check Render dashboard, restart if needed

**B) Wrong URL:**
- Check console error - what URL is it calling?
- Fix: Set correct REACT_APP_API_URL

**C) DNS not propagated:**
- If using custom domain: https://api.resumind.ramadanrexhepi.dev
- Check: https://dnschecker.org
- Fix: Wait or use direct Render URL for now

---

### Issue 2: "CORS policy blocked"

**Symptoms:**
- Console shows: `Access to fetch has been blocked by CORS policy`
- Red text mentioning CORS

**Causes & Fixes:**

**A) Backend not configured for your domain:**
- Check Render logs for "Blocked by CORS: your-domain.com"
- Fix: Backend already configured (I set it up) - check you're using correct URL

**B) Using wrong protocol:**
- Calling http:// instead of https://
- Fix: Make sure REACT_APP_API_URL uses https://

---

### Issue 3: 404 Not Found

**Symptoms:**
- Console shows: `404 Not Found`
- Network tab shows status 404

**Causes & Fixes:**

**A) Wrong endpoint:**
- Calling `/auth/login` instead of `/api/auth/login`
- Fix: Check AuthContext.jsx - should add `/api/auth` to base URL

**B) Backend route doesn't exist:**
- Backend not deployed correctly
- Fix: Check Render logs, redeploy if needed

---

### Issue 4: Environment Variable Not Working

**Symptoms:**
- `console.log(process.env.REACT_APP_API_URL)` shows `undefined`
- Still calling wrong URL

**Causes & Fixes:**

**Local Development:**
- `.env.local` doesn't exist
- Fix: I just created it - restart dev server
- Forgot to restart dev server
- Fix: Ctrl+C and `npm start` again

**Production (Vercel):**
- Environment variable not set
- Fix: Add in Vercel Settings → Environment Variables
- Didn't redeploy after adding env var
- Fix: **MUST redeploy!** Env vars only work in new builds

---

## 🎯 Quick Wins:

### For Immediate Testing (Local):

```bash
# Use deployed backend (no local backend needed)
npm start

# Should connect to: https://resumind-vlu4.onrender.com
# I already updated .env.local for you
```

### For Production:

1. Set `REACT_APP_API_URL` in Vercel
2. **Redeploy** (don't skip this!)
3. Wait 2-3 minutes
4. Test

---

## 💡 Pro Debugging Tips:

### Tip 1: Check Both Ends

**Frontend (Browser Console):**
```javascript
// Check what URL is being used
console.log(process.env.REACT_APP_API_URL)

// Check if login function exists
console.log(typeof login)  // should be "function"
```

**Backend (Render Logs):**
- Watch for incoming requests
- Check for error messages

### Tip 2: Test API Directly

**Use browser or Postman to test:**
```
POST https://resumind-vlu4.onrender.com/api/auth/login
Headers: Content-Type: application/json
Body: {"email":"test@test.com","password":"password123"}
```

Should return JSON response (success or error)

### Tip 3: Simplify

**Start simple and work up:**
1. Test backend health check ✅
2. Test API directly with Postman ✅
3. Test from local frontend ✅
4. Test from deployed frontend ✅
5. Add custom domain ✅

---

## 📞 What to Tell Me:

If still stuck, send me:

1. **Screenshot of browser console error** (F12 → Console)
2. **Screenshot of Network tab** (F12 → Network → Failed request)
3. **Result of backend health check:** https://resumind-vlu4.onrender.com/api/health
4. **Where you're testing:** Local or Vercel?
5. **Environment variable value:** `console.log(process.env.REACT_APP_API_URL)`

---

## ✅ Success Checklist:

You know it's fixed when:

- [ ] Backend health check works
- [ ] `console.log(process.env.REACT_APP_API_URL)` shows correct URL
- [ ] Login attempt shows request in Network tab
- [ ] Request goes to correct URL (https://resumind-vlu4.onrender.com/api/auth/login)
- [ ] No CORS errors in console
- [ ] Login succeeds or shows proper error message (not network error)
- [ ] Render logs show incoming request

---

**Start with the Quick Diagnosis section and let me know what you find!** 🔍
