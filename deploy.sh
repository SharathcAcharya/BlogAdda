#!/bin/bash

# BlogAdda Deployment Script
# This script helps deploy the BlogAdda application

set -e

echo "🚀 BlogAdda Deployment Script"
echo "=============================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the BlogAdda root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Environment setup
echo ""
echo "🔧 Setting up environments..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual values"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please update frontend/.env with your actual values"
fi

# Admin environment
if [ ! -f "admin/.env" ]; then
    echo "📝 Creating admin .env file..."
    cp admin/.env.example admin/.env
    echo "⚠️  Please update admin/.env with your actual values"
fi

echo "✅ Environment files created"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing admin dependencies..."
cd admin
npm install
cd ..

echo "✅ Dependencies installed"

# Build applications
echo ""
echo "🏗️  Building applications..."

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Building admin panel..."
cd admin
npm run build
cd ..

echo "✅ Applications built successfully"

# Database setup
echo ""
echo "💾 Database setup..."

echo "Would you like to seed the database with initial data? (y/n)"
read -r seed_db

if [ "$seed_db" = "y" ] || [ "$seed_db" = "Y" ]; then
    echo "Seeding database..."
    cd backend
    npm run seed
    cd ..
    echo "✅ Database seeded"
fi

# Algolia indexing
echo ""
echo "🔍 Algolia indexing..."

echo "Would you like to index existing blogs in Algolia? (y/n)"
read -r index_blogs

if [ "$index_blogs" = "y" ] || [ "$index_blogs" = "Y" ]; then
    echo "Indexing blogs..."
    cd backend
    npm run index-blogs
    cd ..
    echo "✅ Blogs indexed"
fi

# Final checks
echo ""
echo "🧪 Running final checks..."

# Check if all required environment variables are set
check_env_var() {
    local file=$1
    local var=$2
    local desc=$3
    
    if grep -q "^${var}=your-" "$file" 2>/dev/null; then
        echo "⚠️  Warning: $desc not configured in $file"
        return 1
    fi
    return 0
}

warnings=0

# Check backend environment
if [ -f "backend/.env" ]; then
    check_env_var "backend/.env" "MONGODB_URI" "MongoDB connection" || warnings=$((warnings + 1))
    check_env_var "backend/.env" "JWT_SECRET" "JWT secret" || warnings=$((warnings + 1))
    check_env_var "backend/.env" "ALGOLIA_APP_ID" "Algolia configuration" || warnings=$((warnings + 1))
    check_env_var "backend/.env" "CLOUDINARY_CLOUD_NAME" "Cloudinary configuration" || warnings=$((warnings + 1))
fi

# Check frontend environment
if [ -f "frontend/.env" ]; then
    check_env_var "frontend/.env" "VITE_ALGOLIA_APP_ID" "Frontend Algolia configuration" || warnings=$((warnings + 1))
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo "=================================="

if [ $warnings -gt 0 ]; then
    echo "⚠️  Please address the $warnings warning(s) above before deploying"
else
    echo "✅ All checks passed!"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Update environment variables in .env files"
echo "2. Deploy to your hosting provider"
echo "3. Set up domain and SSL certificates"
echo "4. Configure production database"
echo "5. Test all features in production"

echo ""
echo "📚 Deployment options:"
echo "- Vercel: Connect your GitHub repository"
echo "- Netlify: Upload dist folders"
echo "- Railway/Render: Connect repository"
echo "- VPS: Use PM2 for process management"

echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "Happy deploying! 🚀"
