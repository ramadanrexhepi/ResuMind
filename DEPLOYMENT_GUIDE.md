# Deployment Guide - Fixing the 405 Error

## What Was Wrong

The 405 error occurred because of broken API URL configuration in `src/AuthContext.jsx`:

1. **Broken Logic**: The code was comparing `hostname` (e.g., "localhost") to full URLs with paths
2. **Malformed URLs**: This resulted in incorrect API endpoints like `https://resu-mind.../auth/api/auth`
3. **Missing Backend**: Your frontend is deployed on Vercel, but the backend server isn't deployed anywhere
4. **CORS Issues**: The backend wasn't configured to accept requests from your Vercel domain

## What I Fixed

### 1. Fixed AuthContext.jsx (src/AuthContext.jsx)
- ✅ Proper hostname detection (localhost vs production)
- ✅ Environment variable support (`REACT_APP_API_URL`)
- ✅ Correct API URL construction

### 2. Updated Backend CORS (backend/server.js)
- ✅ Added your Vercel production URL to allowed origins
- ✅ Allow all `*.vercel.app` domains (for preview deployments)
- ✅ Better CORS error logging

### 3. Created Environment Files
- ✅ `.env.example` - Template for environment variables
- ✅ `.env.local` - Local development configuration

## Next Steps - Deploy Your Backend

Your backend (the Express.js server in the `backend/` folder) needs to be deployed separately. Here are your options:

### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. **Create a Render account**: https://render.com
2. **Create a New Web Service**:
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start` (or `node server.js`)
3. **Add Environment Variables** in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://resumeai_user:1TkzOYVf6o4NoXRJ@cluster0.voga4wa.mongodb.net/test
   PORT=5050
   OPENAI_API_KEY=your-openai-api-key-here
   NODE_ENV=production
   ```
4. **Deploy** and copy the URL (e.g., `https://your-app.onrender.com`)

### Option 2: Deploy to Railway

1. **Create a Railway account**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Configure**:
   - Root directory: `backend`
   - Start command: `node server.js`
4. **Add Environment Variables** (same as above)
5. **Deploy** and copy the URL

### Option 3: Deploy to Heroku

1. **Create a Heroku account**: https://heroku.com
2. **Create new app** from the Heroku dashboard
3. **Connect GitHub** repository
4. **Add buildpack**: `heroku/nodejs`
5. **Set Config Vars** (environment variables)
6. **Deploy**

## Configure Vercel Environment Variables

Once your backend is deployed:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add this variable**:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-backend-url.com (WITHOUT /api/auth)
   ```
   Example: `https://resuma-backend.onrender.com`

3. **Redeploy** your Vercel app to apply the changes

## Update AuthContext for Production

If you don't want to use environment variables, you can hardcode your backend URL in `src/AuthContext.jsx` line 25:

```javascript
// Replace this line:
return 'YOUR_BACKEND_URL_HERE/api/auth';

// With your actual backend URL:
return 'https://your-backend-url.onrender.com/api/auth';
```

## Testing

### Local Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm start`
3. Test login/signup at http://localhost:3000

### Production Testing
1. Deploy backend to Render/Railway/Heroku
2. Add `REACT_APP_API_URL` to Vercel environment variables
3. Redeploy on Vercel
4. Test at your Vercel URL

## Important Security Notes

⚠️ **IMPORTANT**: Your `.env` file contains sensitive credentials (MongoDB URI and OpenAI API key). These are currently exposed in this guide. You should:

1. **Rotate your OpenAI API key** at https://platform.openai.com/api-keys
2. **Create a new MongoDB user** with a new password
3. **Never commit `.env` files** to git (already handled by `.gitignore`)

## Troubleshooting

### Still getting 405 errors?
- Check browser console for the exact URL being called
- Verify `REACT_APP_API_URL` is set in Vercel
- Check backend logs for CORS errors

### CORS errors?
- Ensure your Vercel URL is in `allowedOrigins` in `backend/server.js`
- Backend should log blocked origins with `⚠️ Blocked by CORS:`

### Backend not responding?
- Check if backend is running (visit `https://your-backend-url.com/api/health`)
- Verify environment variables are set correctly
- Check backend logs for errors

## Quick Fix Summary

1. ✅ Fixed `src/AuthContext.jsx` - proper API URL logic
2. ✅ Updated `backend/server.js` - CORS configuration
3. ✅ Created environment variable files
4. 🔲 **YOU NEED TO**: Deploy backend to Render/Railway/Heroku
5. 🔲 **YOU NEED TO**: Add `REACT_APP_API_URL` to Vercel environment variables
6. 🔲 **YOU NEED TO**: Redeploy on Vercel

---

**Need help?** Check the logs in your browser console and backend server logs to see where requests are failing.
