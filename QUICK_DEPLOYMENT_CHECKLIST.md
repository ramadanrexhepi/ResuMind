# Quick Deployment Checklist ✅

Use this checklist to deploy your app with custom domain: **resumind.ramadanrexhepi.dev**

## 1️⃣ Deploy Backend to Render (15 minutes)

- [ ] Go to https://render.com and sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure:
  - Root Directory: `backend` (IMPORTANT: Just "backend", not "resuma-ai-app/backend")
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: **Free**
- [ ] Add Environment Variables:
  - `MONGODB_URI` (copy from backend/.env)
  - `OPENAI_API_KEY` (copy from backend/.env)
  - `PORT=5050`
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Copy your Render URL: `https://resuma-backend.onrender.com`
- [ ] Test: Visit `https://resuma-backend.onrender.com/api/health` (should see "OK")

## 2️⃣ Configure Custom Domain (10 minutes)

### In Render:
- [ ] Go to Service → Settings → Custom Domain
- [ ] Click "Add Custom Domain"
- [ ] Enter: `resumind.ramadanrexhepi.dev`
- [ ] Copy the CNAME target (e.g., `resuma-backend.onrender.com`)

### In Namecheap:
- [ ] Log in to https://www.namecheap.com
- [ ] Go to Domain List → Manage `ramadanrexhepi.dev`
- [ ] Click "Advanced DNS" tab
- [ ] Add New Record:
  - **Type**: CNAME Record
  - **Host**: resumind
  - **Value**: `resuma-backend.onrender.com` (from Render)
  - **TTL**: Automatic
- [ ] Save All Changes

### Wait & Test:
- [ ] Wait 5-30 minutes for DNS propagation
- [ ] Check: https://dnschecker.org/#CNAME/resumind.ramadanrexhepi.dev
- [ ] Test: Visit `https://resumind.ramadanrexhepi.dev/api/health`

## 3️⃣ Update Vercel (5 minutes)

- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Add new variable:
  - **Name**: `REACT_APP_API_URL`
  - **Value**: `https://resumind.ramadanrexhepi.dev`
  - **Environments**: Check all (Production, Preview, Development)
- [ ] Save
- [ ] Go to Deployments tab
- [ ] Click latest deployment → Redeploy
- [ ] Wait for redeployment (2-3 minutes)

## 4️⃣ Final Testing (5 minutes)

- [ ] Visit your Vercel URL: https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app
- [ ] Open browser console (F12 → Console tab)
- [ ] Try to **Sign Up** with a test account
- [ ] Try to **Login** with the test account
- [ ] Upload a test resume
- [ ] Check for any errors in console
- [ ] Verify backend requests go to: `https://resumind.ramadanrexhepi.dev/api/auth/...`

---

## Troubleshooting

### ❌ DNS not working?
- Wait longer (can take up to 48 hours)
- Clear browser cache: Ctrl+Shift+Delete
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo killall -HUP mDNSResponder` (Mac)

### ❌ Still getting 405 errors?
- Check that `REACT_APP_API_URL` is set in Vercel
- Verify you redeployed Vercel after adding the variable
- Check browser console for exact URL being called

### ❌ Backend not responding?
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set
- Make sure backend is deployed (Status should be "Live")

### ❌ CORS errors?
- Check Render logs for "Blocked by CORS" messages
- Verify your Vercel URL is working
- The backend is already configured to allow all *.vercel.app domains

---

## Summary

After completing these steps:

✅ Backend running at: `https://resumind.ramadanrexhepi.dev`
✅ Frontend running at: `https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app`
✅ Database: MongoDB Atlas (already configured)
✅ Custom domain: Using your Namecheap DNS
✅ Cost: **FREE** (all on free tiers)

---

## Optional: Custom Frontend Domain

Want the frontend at a custom domain too? (e.g., `app.resumind.ramadanrexhepi.dev`)

1. In Vercel: Settings → Domains → Add Domain → Enter `app.resumind.ramadanrexhepi.dev`
2. Vercel will give you a CNAME value
3. In Namecheap DNS, add:
   - Type: CNAME
   - Host: `app.resumind`
   - Value: (from Vercel, usually `cname.vercel-dns.com`)
4. Wait for DNS propagation
5. Done! Access your app at: `https://app.resumind.ramadanrexhepi.dev`

---

**Total Time**: ~35 minutes
**Cost**: $0
**Result**: Professional deployment with custom domain! 🚀
