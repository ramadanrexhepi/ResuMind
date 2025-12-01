# Professional Domain Setup - Frontend + Backend

## 🎯 Goal: Users See resumind.ramadanrexhepi.dev

**New Professional Setup:**
```
Frontend (Website):  https://resumind.ramadanrexhepi.dev
Backend (API):       https://api.resumind.ramadanrexhepi.dev
```

This is the industry-standard approach!

---

## 📊 Architecture Overview:

```
┌─────────────────────────────────────────────────────────┐
│  USER visits:                                           │
│  https://resumind.ramadanrexhepi.dev                    │
│  ↓                                                      │
│  Cloudflare DNS routes to Vercel                       │
│  ↓                                                      │
│  VERCEL serves React website (Frontend)                │
│  - User sees login page, upload button, etc.           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ User clicks "Upload Resume"
                 │ Frontend makes API call to:
                 │ https://api.resumind.ramadanrexhepi.dev/api/analyze/file
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Cloudflare DNS routes to Render                       │
│  ↓                                                      │
│  RENDER processes request (Backend)                    │
│  - Analyzes resume with AI                             │
│  - Saves to MongoDB                                    │
│  - Returns results                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Complete Setup Guide:

### Step 1: Move Backend to API Subdomain (Render)

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click your service:** `resumind` or `resuma-backend`
3. **Click "Settings"** (left sidebar)
4. **Scroll to "Custom Domain"** section
5. **Remove old domain:**
   - Find: `resumind.ramadanrexhepi.dev`
   - Click **X** to remove it
6. **Add new domain:**
   - Click **"Add Custom Domain"**
   - Enter: `api.resumind.ramadanrexhepi.dev`
   - Click **"Save"**

**Note:** Render will show you need to update your CNAME record.

---

### Step 2: Update Cloudflare DNS Records

**Go to Cloudflare Dashboard:** https://dash.cloudflare.com

#### A) Update Existing CNAME for Backend:

1. **Find the record:**
   ```
   Type: CNAME
   Name: resumind
   Target: resumind-vlu4.onrender.com
   ```

2. **Click "Edit"** (pencil icon)

3. **Change the Name field:**
   ```
   FROM:  resumind
   TO:    api.resumind
   ```
   Keep Target as: `resumind-vlu4.onrender.com`

4. **Make sure proxy is OFF** (gray cloud ⚫)

5. **Save**

**Result:**
```
┌──────┬──────────────┬─────────────────────────────┬───────┐
│ CNAME│ api.resumind │ resumind-vlu4.onrender.com  │  ⚫   │
└──────┴──────────────┴─────────────────────────────┴───────┘
```

#### B) Add New CNAME for Frontend:

1. **Click "Add Record"**

2. **Fill in:**
   ```
   Type:     CNAME
   Name:     resumind
   Target:   cname.vercel-dns.com
   Proxy:    ⚫ DNS only (gray cloud - turn OFF proxy!)
   TTL:      Auto
   ```

3. **Save**

**Result:**
```
┌──────┬──────────┬─────────────────────────────┬───────┐
│ CNAME│ resumind │ cname.vercel-dns.com        │  ⚫   │
└──────┴──────────┴─────────────────────────────┴───────┘
```

---

### Step 3: Add Custom Domain in Vercel

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Click your project** (ResuMind)
3. **Click "Settings"** → **"Domains"** tab
4. **In the "Add Domain" field, enter:**
   ```
   resumind.ramadanrexhepi.dev
   ```
5. **Click "Add"**

**Vercel will:**
- Verify the CNAME record (may take 2-5 minutes)
- Automatically provision SSL certificate
- Set up the domain

**Status should show:** ✅ Valid Configuration

---

### Step 4: Update Environment Variable in Vercel

1. **Still in Vercel** → **Settings** → **"Environment Variables"**
2. **Find or add:**
   ```
   Name:  REACT_APP_API_URL
   Value: https://api.resumind.ramadanrexhepi.dev
   ```
3. **Select all environments:** Production, Preview, Development
4. **Click "Save"**

---

### Step 5: Redeploy Vercel

**Environment variables only take effect after redeployment!**

1. **Go to "Deployments"** tab
2. **Find latest deployment** (top of list)
3. **Click three dots (•••)** on the right
4. **Click "Redeploy"**
5. **Confirm**
6. **Wait 2-3 minutes** for build to complete

---

### Step 6: Push Code Changes to GitHub

I updated your `AuthContext.jsx` file. Push the changes:

```bash
git push origin main
```

This will trigger another Vercel deployment automatically.

---

## ⏳ Wait for DNS Propagation

**Time:** 5-30 minutes (usually ~10 minutes)

**Check progress:**

### Backend DNS:
https://dnschecker.org/#CNAME/api.resumind.ramadanrexhepi.dev
- Should show: `resumind-vlu4.onrender.com`

### Frontend DNS:
https://dnschecker.org/#CNAME/resumind.ramadanrexhepi.dev
- Should show: `cname.vercel-dns.com`

**When both show green checkmarks worldwide → Ready to test!**

---

## ✅ Testing Your Setup

### Test 1: Backend API Health Check

**Visit:** https://api.resumind.ramadanrexhepi.dev/api/health

**Should return:**
```json
{
  "status": "OK",
  "message": "Backend is running!",
  "timestamp": "2024-12-01T..."
}
```

✅ **If this works → Backend is configured correctly!**

---

### Test 2: Frontend Website

**Visit:** https://resumind.ramadanrexhepi.dev

**Should show:**
- Your ResuMind homepage
- Login/Signup buttons
- Professional looking website

✅ **If this works → Frontend is configured correctly!**

---

### Test 3: Complete User Flow

1. **Visit:** https://resumind.ramadanrexhepi.dev
2. **Open browser console:** F12 → Console tab
3. **Click "Sign Up"**
4. **Create test account**
5. **Check console:**
   - Should show API call to: `https://api.resumind.ramadanrexhepi.dev/api/auth/signup`
   - Should succeed ✅
6. **Try logging in**
7. **Try uploading a resume**
8. **Check for any errors in console**

✅ **If everything works → Setup complete!**

---

## 📋 Your Final URLs:

| Purpose | URL | Hosted On |
|---------|-----|-----------|
| **Users visit (Frontend)** | https://resumind.ramadanrexhepi.dev | Vercel |
| **API endpoint (Backend)** | https://api.resumind.ramadanrexhepi.dev | Render |
| **Old Vercel URL** | https://resu-mind.vercel.app | Still works! |
| **Old Render URL** | https://resumind-vlu4.onrender.com | Still works! |

**Users only need to know:** `https://resumind.ramadanrexhepi.dev` ✨

---

## 🎨 Professional Domain Structure:

This is how professional apps do it:

```
ramadanrexhepi.dev                      → Your portfolio
www.ramadanrexhepi.dev                  → Your portfolio
resumind.ramadanrexhepi.dev             → ResuMind app (Frontend)
api.resumind.ramadanrexhepi.dev         → ResuMind API (Backend)
```

You could also add later:
```
blog.ramadanrexhepi.dev                 → Your blog
docs.resumind.ramadanrexhepi.dev        → ResuMind docs
```

---

## 🐛 Troubleshooting

### "resumind.ramadanrexhepi.dev still shows 'route not found'"

**Cause:** DNS not updated yet or Vercel not verified

**Fix:**
1. Check Cloudflare CNAME: `resumind` → `cname.vercel-dns.com`
2. Check Vercel Domains tab: Should show ✅ next to domain
3. Wait 10 more minutes for DNS
4. Clear browser cache: Ctrl+Shift+Delete

---

### "api.resumind.ramadanrexhepi.dev not working"

**Cause:** DNS not updated or SSL not provisioned

**Fix:**
1. Check Cloudflare CNAME: `api.resumind` → `resumind-vlu4.onrender.com`
2. Check Cloudflare proxy is OFF (gray cloud ⚫)
3. Check Render custom domain shows ✅
4. Wait for SSL (5-10 minutes)

---

### "Frontend loads but signup/login doesn't work"

**Cause:** Environment variable not set or Vercel not redeployed

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify: `REACT_APP_API_URL=https://api.resumind.ramadanrexhepi.dev`
3. **Redeploy Vercel** (this is critical!)
4. Push code changes: `git push origin main`
5. Check browser console for errors

---

### "CORS errors in browser console"

**Cause:** Backend not allowing frontend domain

**Fix:**
1. Check backend/server.js - should allow `*.vercel.app` and your custom domain
2. Check Render logs for "Blocked by CORS" messages
3. Backend CORS is already configured correctly (I set it up)
4. May need to wait for Vercel redeploy

---

## 🔒 SSL Certificates

**Both domains get automatic FREE SSL:**
- Vercel provides SSL for: `resumind.ramadanrexhepi.dev`
- Render provides SSL for: `api.resumind.ramadanrexhepi.dev`

**No configuration needed!** Just wait 5-10 minutes after DNS propagation.

---

## 📊 DNS Records Summary

After setup, your Cloudflare DNS should have:

```
┌──────┬──────────────┬─────────────────────────────┬───────┬─────┐
│ Type │ Name         │ Target                      │ Proxy │ TTL │
├──────┼──────────────┼─────────────────────────────┼───────┼─────┤
│ CNAME│ resumind     │ cname.vercel-dns.com        │  ⚫   │Auto │
│ CNAME│ api.resumind │ resumind-vlu4.onrender.com  │  ⚫   │Auto │
└──────┴──────────────┴─────────────────────────────┴───────┴─────┘
```

Both with **gray cloud ⚫ (DNS only)**!

---

## 🎉 Success Criteria

**You're done when:**

✅ `https://resumind.ramadanrexhepi.dev` → Shows your website
✅ `https://api.resumind.ramadanrexhepi.dev/api/health` → Returns `{"status":"OK"}`
✅ Users can sign up on your website
✅ Users can login
✅ Users can upload and analyze resumes
✅ No errors in browser console
✅ All API calls go to `api.resumind.ramadanrexhepi.dev`

---

## 🚀 Quick Start Checklist

Follow these steps in order:

- [ ] **Render:** Remove old domain, add `api.resumind.ramadanrexhepi.dev`
- [ ] **Cloudflare:** Edit CNAME - change `resumind` to `api.resumind`
- [ ] **Cloudflare:** Add new CNAME - `resumind` → `cname.vercel-dns.com` (gray cloud!)
- [ ] **Vercel:** Add domain `resumind.ramadanrexhepi.dev`
- [ ] **Vercel:** Update env var to `https://api.resumind.ramadanrexhepi.dev`
- [ ] **Vercel:** Redeploy
- [ ] **Local:** Push code: `git push origin main`
- [ ] **Wait:** 10-30 minutes for DNS
- [ ] **Test:** Frontend at https://resumind.ramadanrexhepi.dev
- [ ] **Test:** Backend at https://api.resumind.ramadanrexhepi.dev/api/health
- [ ] **Test:** Full user flow (signup, login, upload)

---

**Total time:** ~30 minutes (mostly waiting for DNS)
**Cost:** Still $0 (just your $10/year domain)
**Result:** Professional, branded app! 🎯

---

## 💡 Why This is Better:

**Before:**
- Users: `https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app` 😕
- Confusing, long URL

**After:**
- Users: `https://resumind.ramadanrexhepi.dev` ✨
- Clean, professional, memorable!

---

**Ready to start?** Begin with Step 1 (Render) and work through each step!
