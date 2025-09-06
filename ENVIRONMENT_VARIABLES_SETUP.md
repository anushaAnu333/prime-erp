# 🔧 Environment Variables Setup for Vercel Deployment

## 📋 Complete Environment Variables List

Based on your `backend/env.example` and `frontend/env.example`, here are all the environment variables you need to add to Vercel:

### 🎯 **Required Environment Variables**

#### **Backend Variables:**
```bash
MONGODB_URI=mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app
LOG_LEVEL=info
```

#### **Frontend Variables:**
```bash
NEXT_PUBLIC_API_URL=https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app
NEXT_PUBLIC_APP_URL=https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app
```

## 🚀 **How to Add Environment Variables**

### **Method 1: Vercel Dashboard (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: `prime-erp`
3. Go to **Settings** → **Environment Variables**
4. Add each variable one by one:

#### **Step-by-Step:**

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
   - Value: `https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

6. **LOG_LEVEL**
   - Name: `LOG_LEVEL`
   - Value: `info`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

7. **NEXT_PUBLIC_API_URL**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

8. **NEXT_PUBLIC_APP_URL**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### **Method 2: Vercel CLI (Alternative)**

If you prefer using CLI, here are the commands:

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
# Enter: https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app

vercel env add LOG_LEVEL
# Enter: info

# Frontend Variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app
```

## ✅ **After Adding Variables**

1. **Redeploy your application:**
   ```bash
   vercel --prod
   ```

2. **Verify the deployment:**
   - Visit: https://prime-ik7m0nmc5-anushaanu333s-projects.vercel.app
   - Test login functionality
   - Check if API routes work

## 🔍 **Verify Environment Variables**

Check if all variables are set:
```bash
vercel env ls
```

## 🚨 **Important Notes**

1. **MongoDB URI**: Make sure your MongoDB Atlas cluster allows connections from Vercel
2. **CORS_ORIGIN**: Should match your Vercel domain
3. **NEXT_PUBLIC_***: These variables are exposed to the browser
4. **Security**: Never commit actual environment variables to Git

## 🎯 **Your Current Status**

✅ **Already Set:**
- MONGODB_URI
- NEXT_PUBLIC_APP_URL

🔄 **Need to Add:**
- JWT_SECRET
- NODE_ENV
- PORT
- CORS_ORIGIN
- LOG_LEVEL
- NEXT_PUBLIC_API_URL

## 🚀 **Next Steps**

1. Add all missing environment variables
2. Redeploy the application
3. Test all functionality
4. Your Prima ERP will be fully functional on Vercel!
