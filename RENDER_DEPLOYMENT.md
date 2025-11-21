# Complete Render Deployment Guide

This guide will help you deploy all three parts of the Healthcare Appointment System on Render:
1. Backend API
2. Frontend (Patient Portal)
3. Admin Panel

## Prerequisites

- GitHub repository with all code pushed
- MongoDB Atlas account (or MongoDB database)
- Cloudinary account
- Google Gemini API key
- Razorpay account (optional, for payments)

---

## 1. Deploy Backend API

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `healthcare-appointment-system`

### Step 2: Configure Backend Service
- **Name:** `healthcare-appointment-system-backend`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** (leave empty)
- **Start Command:** `npm start`

### Step 3: Environment Variables
Add these environment variables in Render:

```env
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
JWT_SECRET=your_very_secure_jwt_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
FRONTEND_URL=https://healthcare-appointment-system-frontend.onrender.com
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- `PORT` is automatically set by Render, but you can specify it
- `FRONTEND_URL` will be set after you deploy the frontend (update it then)

### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment to complete.

**Note the backend URL:** `https://healthcare-appointment-system-backend.onrender.com`

---

## 2. Deploy Frontend (Patient Portal)

### Step 1: Create New Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository

### Step 2: Configure Frontend
- **Name:** `healthcare-appointment-system-frontend`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Step 3: Environment Variables
Add this environment variable:

```env
VITE_BACKEND_URL=https://healthcare-appointment-system-backend.onrender.com
```

**Important:** Replace with your actual backend URL from Step 1.

### Step 4: Deploy
Click **"Create Static Site"** and wait for deployment.

**Note the frontend URL:** `https://healthcare-appointment-system-frontend.onrender.com`

---

## 3. Deploy Admin Panel

### Step 1: Create New Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository

### Step 2: Configure Admin Panel
- **Name:** `healthcare-appointment-system-admin`
- **Branch:** `main`
- **Root Directory:** `admin`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Step 3: Environment Variables
Add this environment variable:

```env
VITE_BACKEND_URL=https://healthcare-appointment-system-backend.onrender.com
```

**Important:** Use the same backend URL as frontend.

### Step 4: Deploy
Click **"Create Static Site"** and wait for deployment.

**Note the admin URL:** `https://healthcare-appointment-system-admin.onrender.com`

---

## 4. Update CORS Configuration

After deploying all services, update the backend CORS to include all your URLs:

1. Go to your backend service on Render
2. Edit the environment variable or update the code:

In `backend/server.js`, the `allowedOrigins` array should include:
```javascript
const allowedOrigins = [
  'https://healthcare-appointment-system-frontend.onrender.com',
  'https://healthcare-appointment-system-admin.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
]
```

3. Redeploy the backend after updating

---

## 5. Final Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed with correct `VITE_BACKEND_URL`
- [ ] Admin panel deployed with correct `VITE_BACKEND_URL`
- [ ] Backend CORS updated with all frontend URLs
- [ ] All environment variables set correctly
- [ ] MongoDB connection working
- [ ] Cloudinary configured
- [ ] Gemini API key working
- [ ] Test frontend can connect to backend
- [ ] Test admin panel can connect to backend

---

## Troubleshooting

### Backend Issues

**Port Error:**
- Render automatically sets `PORT` environment variable
- Your code should use `process.env.PORT || 5500`

**CORS Errors:**
- Make sure frontend URL is in `allowedOrigins` array
- Check that `FRONTEND_URL` environment variable matches your frontend URL
- Redeploy backend after CORS changes

**Database Connection:**
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for Render)

### Frontend/Admin Issues

**API Not Working:**
- Verify `VITE_BACKEND_URL` is set correctly
- Check backend URL doesn't have trailing slash
- Rebuild after changing environment variables

**Build Errors:**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build logs in Render dashboard

### Environment Variables

**Not Updating:**
- Static sites require rebuild after env var changes
- Web services auto-restart after env var changes
- Always rebuild static sites when changing `VITE_*` variables

---

## URLs Summary

After deployment, you'll have:

- **Backend API:** `https://healthcare-appointment-system-backend.onrender.com`
- **Frontend:** `https://healthcare-appointment-system-frontend.onrender.com`
- **Admin Panel:** `https://healthcare-appointment-system-admin.onrender.com`

---

## Cost Information

**Free Tier Limits:**
- Web Services: Sleep after 15 minutes of inactivity (wakes on request)
- Static Sites: Always on, free
- Database: Use MongoDB Atlas free tier

**For Production:**
- Consider upgrading to paid plan for always-on backend
- Or use external services that don't sleep

---

## Next Steps

1. Test all three deployments
2. Update any hardcoded URLs in your code
3. Set up custom domains (optional)
4. Configure SSL certificates (automatic on Render)
5. Set up monitoring and alerts

---

**Need Help?**
- Check Render logs in dashboard
- Review error messages in browser console
- Verify all environment variables are set
- Test API endpoints directly using Postman or curl

