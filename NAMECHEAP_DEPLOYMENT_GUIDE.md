# Deploy ResuMind with Custom Domain (resumind.ramadanrexhepi.dev)

## Overview

You have **Namecheap Stellar Plus hosting** (shared hosting with cPanel). While this is great for PHP/WordPress sites, it has limitations for Node.js applications. Here's the **best solution**:

- **Backend**: Deploy to Render (free, reliable Node.js hosting)
- **Frontend**: Keep on Vercel (already deployed)
- **Domain**: Use Namecheap DNS to point your subdomain to the backend

This gives you a custom domain while using the best hosting for each part of your app!

---

## Step 1: Deploy Backend to Render (Free)

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account (easiest way)

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `ramadanrexhepi/optimizer-ai` (or your repo name)
3. Configure the service:
   - **Name**: `resuma-backend` (or any name you like)
   - **Region**: Choose closest to your users (e.g., Frankfurt for Europe, Oregon for US)
   - **Branch**: `main`
   - **Root Directory**: `backend` (IMPORTANT: Just "backend", not "resuma-ai-app/backend")
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (perfect for your needs)

### 1.3 Add Environment Variables
Click **"Environment"** and add these variables:

```
MONGODB_URI=mongodb+srv://resumeai_user:1TkzOYVf6o4NoXRJ@cluster0.voga4wa.mongodb.net/test?appName=Cluster0
PORT=5050
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
FRONTEND_URL=https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app
```

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (takes 2-5 minutes)
3. You'll get a URL like: `https://resuma-backend.onrender.com`
4. Test it by visiting: `https://resuma-backend.onrender.com/api/health`
   - You should see: `{"status":"OK","message":"Backend is running!","timestamp":"..."}`

---

## Step 2: Configure Custom Domain with Namecheap DNS

Now let's point `resumind.ramadanrexhepi.dev` to your Render backend!

### 2.1 In Render Dashboard
1. Go to your web service → **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `resumind.ramadanrexhepi.dev`
4. Render will give you a **CNAME target** like: `resuma-backend.onrender.com`

### 2.2 In Namecheap Dashboard
1. Log in to Namecheap: https://www.namecheap.com
2. Go to **"Domain List"** → Click **"Manage"** next to `ramadanrexhepi.dev`
3. Go to **"Advanced DNS"** tab
4. Click **"Add New Record"**
5. Add this record:
   ```
   Type: CNAME Record
   Host: resumind
   Value: resuma-backend.onrender.com
   TTL: Automatic
   ```
6. Click **"Save All Changes"**

### 2.3 Wait for DNS Propagation
- DNS changes take **5-30 minutes** (sometimes up to 48 hours)
- Check status: https://dnschecker.org/#CNAME/resumind.ramadanrexhepi.dev

### 2.4 Test Your Custom Domain
Once DNS propagates, test:
```
https://resumind.ramadanrexhepi.dev/api/health
```

You should see the backend health check response!

---

## Step 3: Update Frontend to Use Custom Backend Domain

### 3.1 Update Vercel Environment Variables
1. Go to **Vercel Dashboard** → Your Project → **"Settings"** → **"Environment Variables"**
2. Add or update:
   ```
   Name: REACT_APP_API_URL
   Value: https://resumind.ramadanrexhepi.dev
   ```
3. **Important**: Check all environments (Production, Preview, Development)

### 3.2 Redeploy Vercel
1. Go to **"Deployments"** tab
2. Click the three dots on the latest deployment → **"Redeploy"**
3. Wait for deployment to complete

### 3.3 Update AuthContext (Optional Fallback)
Edit `src/AuthContext.jsx` line 25 as a fallback:

```javascript
// Replace:
return 'YOUR_BACKEND_URL_HERE/api/auth';

// With:
return 'https://resumind.ramadanrexhepi.dev/api/auth';
```

---

## Step 4: Test Everything

### Test Backend Directly
```bash
# Health check
curl https://resumind.ramadanrexhepi.dev/api/health

# Should return:
# {"status":"OK","message":"Backend is running!","timestamp":"..."}
```

### Test Frontend
1. Visit your Vercel URL: `https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app`
2. Try to **Sign Up** or **Login**
3. Check browser console (F12) for any errors
4. Try uploading a resume

---

## Alternative: Deploy Frontend to Namecheap Too (Optional)

If you want to host the **frontend** on Namecheap as well:

### Option A: Use Namecheap for Static Files
1. **Build your React app**:
   ```bash
   npm run build
   ```
2. **Upload to Namecheap**:
   - Go to cPanel → **File Manager**
   - Navigate to `public_html/resumind/`
   - Upload all files from `build/` folder
3. **Access**: `https://ramadanrexhepi.dev/resumind/`

### Option B: Custom Frontend Subdomain
1. Create another subdomain: `app.resumind.ramadanrexhepi.dev`
2. Point it to Vercel in Namecheap DNS:
   ```
   Type: CNAME Record
   Host: app.resumind
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```
3. Add domain in Vercel dashboard → Settings → Domains

---

## Architecture Summary

After setup, your architecture will be:

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  https://your-vercel-url.vercel.app     │
│  OR                                     │
│  https://app.resumind.ramadanrexhepi.dev│
└──────────────┬──────────────────────────┘
               │
               │ API calls
               ▼
┌─────────────────────────────────────────┐
│  Backend (Render)                       │
│  https://resumind.ramadanrexhepi.dev    │
│  (points to Render via CNAME)           │
└──────────────┬──────────────────────────┘
               │
               │ Database queries
               ▼
┌─────────────────────────────────────────┐
│  MongoDB Atlas (Cloud)                  │
│  cluster0.voga4wa.mongodb.net           │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### DNS Not Working?
- Wait longer (up to 48 hours)
- Clear your DNS cache:
  - Windows: `ipconfig /flushdns`
  - Mac: `sudo killall -HUP mDNSResponder`
- Check: https://dnschecker.org/#CNAME/resumind.ramadanrexhepi.dev

### 405 Errors Still Happening?
- Check browser console for exact URL being called
- Verify `REACT_APP_API_URL` is set in Vercel
- Make sure you redeployed Vercel after adding the variable

### Backend Not Responding?
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set in Render
- Test health endpoint: `https://resumind.ramadanrexhepi.dev/api/health`

### CORS Errors?
- Check Render logs for `⚠️ Blocked by CORS:` messages
- Verify your Vercel URL is in the `allowedOrigins` array
- The code I fixed should allow all `*.vercel.app` domains

---

## Cost Breakdown

- **Namecheap Domain**: ~$10/year (you already have this)
- **Render Backend**: **FREE** (500+ hours/month on free tier)
- **Vercel Frontend**: **FREE** (generous free tier)
- **MongoDB Atlas**: **FREE** (you're using the free tier)

**Total Additional Cost: $0** ✅

---

## Why This Setup is Better Than Shared Hosting

| Feature | Shared Hosting | This Setup |
|---------|---------------|------------|
| Node.js Support | ❌ Limited/None | ✅ Full support |
| Auto-scaling | ❌ No | ✅ Yes |
| Easy updates | ❌ Manual FTP | ✅ Git push |
| Monitoring | ❌ Basic | ✅ Full logs |
| SSL Certificate | ✅ Yes | ✅ Yes (automatic) |
| Cost | ~$30/year | **FREE** |

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Configure custom domain in Namecheap DNS
3. ✅ Update Vercel environment variable
4. ✅ Test everything
5. ✅ Optional: Add custom frontend domain

Need help with any step? Let me know!
