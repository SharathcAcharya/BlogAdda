@echo off
setlocal enabledelayedexpansion

echo 🚀 BlogAdda Deployment Script
echo ==============================

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: Run this script from the BlogAdda root directory
    exit /b 1
)

REM Check prerequisites
echo 🔍 Checking prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Environment setup
echo.
echo 🔧 Setting up environments...

REM Backend environment
if not exist "backend\.env" (
    echo 📝 Creating backend .env file...
    copy "backend\.env.example" "backend\.env" >nul
    echo ⚠️  Please update backend/.env with your actual values
)

REM Frontend environment
if not exist "frontend\.env" (
    echo 📝 Creating frontend .env file...
    copy "frontend\.env.example" "frontend\.env" >nul
    echo ⚠️  Please update frontend/.env with your actual values
)

REM Admin environment
if not exist "admin\.env" (
    echo 📝 Creating admin .env file...
    copy "admin\.env.example" "admin\.env" >nul
    echo ⚠️  Please update admin/.env with your actual values
)

echo ✅ Environment files created

REM Install dependencies
echo.
echo 📦 Installing dependencies...

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
cd ..

echo Installing admin dependencies...
cd admin
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install admin dependencies
    exit /b 1
)
cd ..

echo ✅ Dependencies installed

REM Build applications
echo.
echo 🏗️  Building applications...

echo Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    exit /b 1
)
cd ..

echo Building admin panel...
cd admin
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build admin panel
    exit /b 1
)
cd ..

echo ✅ Applications built successfully

REM Database setup
echo.
echo 💾 Database setup...

set /p seed_db="Would you like to seed the database with initial data? (y/n): "
if /i "%seed_db%"=="y" (
    echo Seeding database...
    cd backend
    call npm run seed
    cd ..
    echo ✅ Database seeded
)

REM Algolia indexing
echo.
echo 🔍 Algolia indexing...

set /p index_blogs="Would you like to index existing blogs in Algolia? (y/n): "
if /i "%index_blogs%"=="y" (
    echo Indexing blogs...
    cd backend
    call npm run index-blogs
    cd ..
    echo ✅ Blogs indexed
)

REM Final message
echo.
echo 🧪 Running system check...
cd backend
call node system-check.js
cd ..

echo.
echo 🎉 Deployment preparation complete!
echo ==================================

echo.
echo 🚀 Next steps:
echo 1. Update environment variables in .env files
echo 2. Deploy to your hosting provider
echo 3. Set up domain and SSL certificates
echo 4. Configure production database
echo 5. Test all features in production

echo.
echo 📚 Deployment options:
echo - Vercel: Connect your GitHub repository
echo - Netlify: Upload dist folders
echo - Railway/Render: Connect repository
echo - VPS: Use PM2 for process management

echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo Happy deploying! 🚀

pause
