#!/bin/bash

echo "🚀 Setting up DSA Note Taking Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001

# Optional: Environment
NODE_ENV=development
EOF
    echo "⚠️  Please update the .env file with your Supabase credentials"
else
    echo "✅ .env file already exists"
fi

# Create dist directory
mkdir -p dist

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your Supabase credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Test with: curl http://localhost:3001/health"
echo ""
echo "🔗 API endpoints will be available at:"
echo "- Health: http://localhost:3001/health"
echo "- Notes: http://localhost:3001/api/notes"
echo "- Topics: http://localhost:3001/api/topics"
echo "- Graph: http://localhost:3001/api/graph-data" 