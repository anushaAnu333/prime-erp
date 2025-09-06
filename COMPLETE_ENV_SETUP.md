# 🔧 Complete Environment Variables Setup for Vercel

## 📋 **All Required Environment Variables**

Based on your `backend/env.example` and `frontend/env.example`, here are **ALL** the environment variables you need to add to your Vercel project:

### 🎯 **Backend Environment Variables**

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/

# JWT Configuration  
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (Update with your new domain)
CORS_ORIGIN=https://prime-rkry2lld0-anushaanu333s-projects.vercel.app

# Logging
LOG_LEVEL=info
```

### 🎯 **Frontend Environment Variables**

```bash
# API Configuration (Use same domain for Vercel)
NEXT_PUBLIC_API_URL=https://prime-rkry2lld0-anushaanu333s-projects.vercel.app

# App Configuration
NEXT_PUBLIC_APP_URL=https://prime-rkry2lld0-anushaanu333s-projects.vercel.app
```

## 🚀 **How to Add Environment Variables in Vercel**

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project `prime-erp`
3. **Go to**: Settings → Environment Variables
4. **Add each variable** with these exact values:

#### **Step-by-Step Addition:**

1. **MONGODB_URI**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **NODE_ENV**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. **PORT**
   - Name: `PORT`
   - Value: `3001`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **CORS_ORIGIN**
   - Name: `CORS_ORIGIN`
   - Value: `https://prime-rkry2lld0-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

6. **LOG_LEVEL**
   - Name: `LOG_LEVEL`
   - Value: `info`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

7. **NEXT_PUBLIC_API_URL**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://prime-rkry2lld0-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

8. **NEXT_PUBLIC_APP_URL**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://prime-rkry2lld0-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### **Method 2: Vercel CLI (Alternative)**

```bash
# Backend Variables
vercel env add MONGODB_URI
# Enter: mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/

vercel env add JWT_SECRET
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30

vercel env add NODE_ENV
# Enter: production

vercel env add PORT
# Enter: 3001

vercel env add CORS_ORIGIN
# Enter: https://prime-rkry2lld0-anushaanu333s-projects.vercel.app

vercel env add LOG_LEVEL
# Enter: info

# Frontend Variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://prime-rkry2lld0-anushaanu333s-projects.vercel.app

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://prime-rkry2lld0-anushaanu333s-projects.vercel.app
```

## ✅ **After Adding All Variables**

1. **Redeploy your application:**
   ```bash
   vercel --prod
   ```

2. **Verify the deployment:**
   - Visit: https://prime-rkry2lld0-anushaanu333s-projects.vercel.app
   - Test login functionality
   - Check if all API routes work

## 🔍 **Verify Environment Variables**

Check if all variables are set:
```bash
vercel env ls
```

## 🚨 **Important Notes**

1. **MongoDB Atlas**: Make sure your MongoDB Atlas cluster allows connections from Vercel
2. **Domain Update**: Update CORS_ORIGIN and NEXT_PUBLIC_* URLs with your actual deployment URL
3. **Security**: Never commit actual environment variables to Git
4. **All Environments**: Make sure to add variables to Production, Preview, and Development

## 🎯 **Your Current Deployment**

- **URL**: https://prime-rkry2lld0-anushaanu333s-projects.vercel.app
- **Status**: Building
- **Project**: prime-erp

## 🚀 **Next Steps**

1. ✅ Add all environment variables (use the values above)
2. ✅ Wait for build to complete
3. ✅ Test your application
4. ✅ Your Prima ERP will be fully functional!

**Copy and paste these exact values into your Vercel environment variables!**
