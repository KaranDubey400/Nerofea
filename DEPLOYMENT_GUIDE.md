# Deployment Guide

This guide will help you deploy your DSA Note Taking application to:
- **GitHub**: Source code repository
- **Render**: Backend API hosting
- **Vercel**: Frontend hosting

## Prerequisites

1. **GitHub Account**: For source code hosting
2. **Render Account**: For backend API hosting (free tier available)
3. **Vercel Account**: For frontend hosting (free tier available)
4. **Supabase Project**: Already set up for database and authentication

## Step 1: GitHub Repository Setup

### 1.1 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `dsa-notetaking-app`
3. Make it public or private (your choice)
4. **Don't** initialize with README, .gitignore, or license (since you already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/dsa-notetaking-app.git
git branch -M main
git push -u origin main
```

## Step 2: Backend Deployment on Render

### 2.1 Create Render Account
1. Go to [Render](https://render.com) and sign up
2. Connect your GitHub account

### 2.2 Deploy Backend API
1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `dsa-notetaking-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend-api && npm install && npm run build`
   - **Start Command**: `cd backend-api && npm start`
   - **Plan**: Free (or choose paid if needed)

### 2.3 Environment Variables
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 2.4 Health Check
- **Health Check Path**: `/health`
- Render will automatically check this endpoint

## Step 3: Frontend Deployment on Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com) and sign up
2. Connect your GitHub account

### 3.2 Deploy Frontend
1. In Vercel dashboard, click "New Project"
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `/` (root of the project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.3 Environment Variables
Add these environment variables in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

### 3.4 Domain Configuration
- Vercel will provide a default domain like `your-project.vercel.app`
- You can add a custom domain later if needed

## Step 4: Update Configuration

### 4.1 Update CORS Origin
After getting your Vercel domain, update the `CORS_ORIGIN` in Render:
```
CORS_ORIGIN=https://your-project.vercel.app
```

### 4.2 Update API URL in Frontend
Update your frontend code to use the Render API URL:
```typescript
// In your API calls, use:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

## Step 5: Supabase Functions Deployment

### 5.1 Deploy Supabase Functions
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy
```

## Step 6: Environment Variables Reference

### Backend (Render) Environment Variables:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGIN=https://your-project.vercel.app
```

### Frontend (Vercel) Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

## Step 7: Testing Deployment

### 7.1 Test Backend Health
Visit: `https://your-backend-service.onrender.com/health`

### 7.2 Test Frontend
Visit: `https://your-project.vercel.app`

### 7.3 Test API Endpoints
```bash
# Test notes endpoint
curl https://your-backend-service.onrender.com/api/notes

# Test health endpoint
curl https://your-backend-service.onrender.com/health
```

## Step 8: Continuous Deployment

Both Render and Vercel will automatically deploy when you push changes to your GitHub repository.

### 8.1 Development Workflow
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployment will trigger
```

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render/Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names
   - Restart services after adding new variables

3. **CORS Issues**
   - Verify CORS_ORIGIN is set to your Vercel domain
   - Check that the domain includes `https://`

4. **API Connection Issues**
   - Verify the API URL is correct in frontend
   - Check that the backend is running and accessible
   - Test the health endpoint

### Useful Commands:
```bash
# Check backend logs
# Go to Render dashboard → Your service → Logs

# Check frontend logs
# Go to Vercel dashboard → Your project → Deployments → View Function Logs

# Test local development
npm run dev  # Frontend
cd backend-api && npm run dev  # Backend
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to GitHub
2. **CORS**: Only allow your frontend domain
3. **Rate Limiting**: Already configured in backend
4. **HTTPS**: Both Render and Vercel provide SSL certificates

## Cost Considerations

- **Render Free Tier**: 750 hours/month, 512MB RAM
- **Vercel Free Tier**: 100GB bandwidth/month, 100GB storage
- **Supabase Free Tier**: 500MB database, 50MB file storage

For production use, consider upgrading to paid plans.

## Support

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs 