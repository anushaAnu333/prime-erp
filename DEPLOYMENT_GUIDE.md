# 🚀 Prima ERP Deployment Guide

## Project Structure
```
prima-erp/
├── frontend/          # Next.js Frontend (Deploy to Vercel)
├── backend/           # Express.js Backend (Deploy to Railway/Heroku)
└── vercel.json        # Vercel configuration
```

## 📋 Deployment Steps

### 1. Backend Deployment (Railway/Heroku)

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder as the root directory
4. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secure-jwt-secret
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
5. Deploy and get your backend URL (e.g., `https://your-app.railway.app`)

#### Option B: Heroku
1. Create a new Heroku app
2. Set buildpack to Node.js
3. Set environment variables in Heroku dashboard
4. Deploy from the `backend` folder

### 2. Frontend Deployment (Vercel)

#### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_APP_URL
```

#### Method 2: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Set Root Directory to `frontend`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app
   ```
5. Deploy

### 3. Update Configuration

After getting your backend URL, update:
1. `frontend/vercel.json` - Replace `your-backend-url.railway.app` with actual URL
2. `frontend/lib/config.js` - Update API_BASE_URL
3. Backend CORS_ORIGIN with your frontend URL

## 🔧 Environment Variables

### Backend (.env)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.vercel.app
LOG_LEVEL=info
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app
```

## 🚨 Important Notes

1. **Database**: Ensure MongoDB Atlas allows connections from your deployment platform
2. **CORS**: Update CORS_ORIGIN in backend with your frontend URL
3. **Environment Variables**: Never commit .env files to git
4. **Build Commands**: 
   - Frontend: `npm run build` (in frontend folder)
   - Backend: `npm start` (in backend folder)

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGIN in backend matches frontend URL
2. **API 404**: Verify API URL in frontend environment variables
3. **Build Failures**: Check Node.js version compatibility
4. **Database Connection**: Verify MongoDB URI and network access

### Testing Deployment:
1. Check backend health: `https://your-backend-url.railway.app/api/dashboard`
2. Check frontend: `https://your-frontend-domain.vercel.app`
3. Test login functionality
4. Verify API calls work from frontend

## 📊 Monitoring

- **Vercel**: Check deployment logs in Vercel dashboard
- **Railway**: Monitor backend logs in Railway dashboard
- **MongoDB**: Monitor database performance in MongoDB Atlas

## 🔄 Updates

To update your deployment:
1. Push changes to your main branch
2. Vercel will auto-deploy frontend changes
3. Railway will auto-deploy backend changes
4. Test the updated application
