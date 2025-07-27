#!/bin/bash

echo "🚀 DSA Note Taking App - Deployment Setup"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env template..."
    cat > .env << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Development Configuration
NODE_ENV=development
EOF
    echo "✅ .env template created"
    echo "⚠️  Please update .env with your actual Supabase credentials"
else
    echo "✅ .env file already exists"
fi

# Check if backend-api has .env
if [ ! -f "backend-api/.env" ]; then
    echo "📝 Creating backend-api/.env template..."
    cat > backend-api/.env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend URL (update after deployment)
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ backend-api/.env template created"
    echo "⚠️  Please update backend-api/.env with your actual credentials"
else
    echo "✅ backend-api/.env file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Update .env files with your Supabase credentials"
echo "2. Create a GitHub repository"
echo "3. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/dsa-notetaking-app.git"
echo "   git push -u origin main"
echo "4. Follow the DEPLOYMENT_GUIDE.md for Render and Vercel setup"
echo ""
echo "🔗 Useful Links:"
echo "- Render: https://render.com"
echo "- Vercel: https://vercel.com"
echo "- Supabase: https://supabase.com"
echo ""
echo "📖 Read DEPLOYMENT_GUIDE.md for detailed instructions" 