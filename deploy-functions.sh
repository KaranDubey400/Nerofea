#!/bin/bash

echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy all functions
echo "📦 Deploying groq-chat function..."
supabase functions deploy groq-chat

echo "📦 Deploying tavily-search function..."
supabase functions deploy tavily-search

echo "📦 Deploying huggingface-generate function..."
supabase functions deploy huggingface-generate

echo "📦 Deploying grind-plan-generator function..."
supabase functions deploy grind-plan-generator

echo "✅ All functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Settings > Edge Functions"
echo "3. Add your API keys as environment variables:"
echo "   - GROQ_API_KEY"
echo "   - TAVILY_API_KEY" 
echo "   - HF_API_KEY"
echo "4. Test your functions at: http://localhost:3000/test-api"
echo "5. Test Grind at: http://localhost:3000/grind" 