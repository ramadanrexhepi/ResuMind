# Render Settings - Quick Reference Card

## ✅ Correct Settings for Your Backend

Copy these settings **exactly** as shown:

### Basic Settings
```
Service Name:        resuma-backend (or your choice)
Region:             Frankfurt / Oregon (choose closest to users)
Branch:             main
```

### Build & Deploy Settings
```
Root Directory:     backend
Runtime:            Node
Build Command:      npm install
Start Command:      npm start
```

### Instance Type
```
Instance Type:      Free
```

---

## 🔧 Step-by-Step Configuration

### When Creating New Service:

1. **New + → Web Service**
2. **Connect Repository**: `ramadanrexhepi/ResuMind`
3. **Fill in these fields EXACTLY**:

   ![Image showing Render form fields]

   **Name**: `resuma-backend`

   **Region**: `Frankfurt` (or closest to you)

   **Branch**: `main`

   **Root Directory**: `backend` ⚠️ **IMPORTANT**

   **Environment**: `Node`

   **Build Command**: `npm install` ⚠️ **NOT "npm run build"**

   **Start Command**: `npm start`

   **Plan**: `Free`

4. **Click "Advanced"** (if needed to see all fields)

5. **Add Environment Variables** (see below)

6. **Click "Create Web Service"**

---

## 🌍 Environment Variables to Add

Click "Environment" or "Advanced" → Add these:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://resumeai_user:1TkzOYVf6o4NoXRJ@cluster0.voga4wa.mongodb.net/test?appName=Cluster0` |
| `PORT` | `5050` |
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `your-openai-api-key-here` |
| `FRONTEND_URL` | `https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app` |

---

## ❌ Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct | Why |
|---------|----------|-----|
| Root: `resuma-ai-app/backend` | Root: `backend` | Wrong folder path |
| Build: `npm run build` | Build: `npm install` | No build script exists |
| Start: `node index.js` | Start: `npm start` | Wrong entry file |
| Missing env vars | All 5 env vars added | App won't work |

---

## 📊 What Success Looks Like

After deployment (2-5 minutes), you should see:

```
✅ Status: Live (green dot)
✅ URL: https://resuma-backend.onrender.com
✅ Logs show: "Backend server running on http://localhost:5050"
✅ Logs show: "MongoDB connected"
✅ Health check works: https://your-url.onrender.com/api/health
```

---

## 🔍 How to Check Your Settings

### If Already Created:

1. Go to **Dashboard** → Your Service
2. Click **"Settings"** (left sidebar)
3. Scroll to **"Build & Deploy"**
4. Verify:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click **"Environment"** tab
6. Verify all 5 environment variables are present

### To Update Settings:

1. Change any incorrect values
2. Click **"Save Changes"** at the bottom
3. Render will **automatically redeploy**
4. Wait 2-5 minutes
5. Check logs for success

---

## 📝 Copy-Paste Template

If Render asks for a `render.yaml` file (optional), here's the content:

```yaml
services:
  - type: web
    name: resuma-backend
    env: node
    region: frankfurt
    plan: free
    buildCommand: npm install
    startCommand: npm start
    rootDir: backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5050
```

**Note**: You DON'T need this file if you configure through the UI!

---

## 🆘 Still Not Working?

### Check the Logs:

1. Dashboard → Your Service → **"Logs"** tab
2. Look for these messages:

**Good Signs** ✅:
```
Starting service with 'npm start'
Backend server running on http://localhost:5050
MongoDB connected
```

**Bad Signs** ❌:
```
Missing script: "build" → Change Build Command
Cannot find module → Wrong Root Directory
ECONNREFUSED MongoDB → Wrong MONGODB_URI
Missing OPENAI_API_KEY → Add environment variable
```

### Quick Checklist:

- [ ] Root Directory = `backend` (exactly, no extra folders)
- [ ] Build Command = `npm install` (not `npm run build`)
- [ ] Start Command = `npm start` (or `node server.js`)
- [ ] All 5 environment variables added
- [ ] Branch = `main` (or your default branch)
- [ ] Repository = `ramadanrexhepi/ResuMind`

---

## 🎯 Final Configuration Summary

```
┌─────────────────────────────────────┐
│  Render Service Configuration       │
├─────────────────────────────────────┤
│  Repo: ramadanrexhepi/ResuMind      │
│  Branch: main                       │
│  Root: backend                      │
│  Build: npm install                 │
│  Start: npm start                   │
│  Plan: Free                         │
│                                     │
│  Environment Variables: (5 total)   │
│  ✓ MONGODB_URI                      │
│  ✓ PORT                             │
│  ✓ NODE_ENV                         │
│  ✓ OPENAI_API_KEY                   │
│  ✓ FRONTEND_URL                     │
└─────────────────────────────────────┘
```

**After fixing, deployment should take 2-5 minutes and succeed!** 🚀
