# BlogAdda Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup

#### Backend Environment (.env file)

```bash
# Copy .env.example to .env
cp .env.example .env
```

**Required Environment Variables:**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong JWT secret key
- `ALGOLIA_APP_ID` - Algolia application ID
- `ALGOLIA_ADMIN_API_KEY` - Algolia admin API key
- `ALGOLIA_SEARCH_API_KEY` - Algolia search-only API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration

#### Frontend Environment (.env file)

```bash
# Create .env file in frontend directory
VITE_API_URL=http://localhost:5000/api
VITE_ALGOLIA_APP_ID=your-algolia-app-id
VITE_ALGOLIA_SEARCH_API_KEY=your-algolia-search-api-key
```

### 2. Database Setup

1. **MongoDB Atlas Setup** (Recommended for production)

   - Create MongoDB Atlas account
   - Create cluster and database
   - Get connection string
   - Update `MONGODB_URI` in backend .env

2. **Local MongoDB** (Development)
   - Install MongoDB locally
   - Use: `mongodb://localhost:27017/blogadda`

### 3. Third-Party Services Setup

#### Algolia Search

1. Create Algolia account at https://www.algolia.com/
2. Create a new application
3. Get App ID and API keys from dashboard
4. Update backend and frontend .env files

#### Cloudinary (Image Storage)

1. Create Cloudinary account
2. Get cloud name, API key, and API secret
3. Update backend .env file

#### Email Service (Optional)

1. Set up Gmail app password or use email service
2. Update email configuration in backend .env

## 🔧 Development Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin Panel
cd ../admin
npm install
```

### 2. Initialize Database

```bash
# Backend directory
npm run seed  # Create initial data
npm run index-blogs  # Index existing blogs in Algolia
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Admin Panel
cd admin
npm run dev
```

## 📦 Production Build

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Build Admin Panel

```bash
cd admin
npm run build
```

### 3. Prepare Backend

```bash
cd backend
# Install production dependencies only
npm ci --only=production
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Frontend Deployment

1. Push code to GitHub
2. Connect Vercel to your repository
3. Set environment variables in Vercel dashboard
4. Deploy

#### Backend Deployment (Vercel)

1. Create `vercel.json` in backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Option 2: Netlify (Frontend Only)

1. Build frontend: `npm run build`
2. Deploy `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Option 3: Railway/Render (Full Stack)

1. Connect GitHub repository
2. Set environment variables
3. Deploy both frontend and backend

### Option 4: VPS/Server Deployment

#### Using PM2 for Process Management

1. Install PM2:

```bash
npm install -g pm2
```

2. Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "blogadda-backend",
      script: "./server.js",
      cwd: "./backend",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
```

3. Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 🔒 Security Checklist

- [ ] Strong JWT secrets
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API keys secured

## 📊 Post-Deployment Tasks

### 1. Index Existing Blogs

```bash
# After deployment, run once
npm run index-blogs
```

### 2. Test Features

- [ ] User registration/login
- [ ] Blog creation/editing
- [ ] Search functionality
- [ ] PWA installation
- [ ] Analytics tracking
- [ ] Email notifications

### 3. Monitor Performance

- Check application logs
- Monitor database performance
- Track search analytics
- Monitor PWA metrics

## 🔧 Environment Variables Reference

### Backend (.env)

```env
# Essential
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
CLIENT_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com

# Search
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_API_KEY=your-admin-key
ALGOLIA_SEARCH_API_KEY=your-search-key

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_FROM=noreply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_API_KEY=your-search-key
```

## 🚀 Quick Start Commands

```bash
# Development
npm run dev:all  # If you have concurrently set up

# Production
npm run build:all  # Build all applications
npm start  # Start backend in production mode
```

## 📝 Troubleshooting

### Common Issues

1. **Search not working**

   - Check Algolia API keys
   - Verify blog indexing: `npm run index-blogs`

2. **PWA not installing**

   - Ensure HTTPS in production
   - Check service worker registration

3. **Images not uploading**

   - Verify Cloudinary credentials
   - Check file size limits

4. **Database connection issues**
   - Verify MongoDB URI
   - Check network access (Atlas IP whitelist)

### Debug Commands

```bash
# Check blog indexing
node scripts/indexBlogs.js

# Test API endpoints
node test-api.js

# Check database connection
node debug.js
```

## 📈 Performance Optimization

1. **Frontend**

   - Enable gzip compression
   - Implement code splitting
   - Optimize images
   - Use CDN for static assets

2. **Backend**

   - Enable database indexing
   - Implement caching (Redis)
   - Optimize queries
   - Use connection pooling

3. **Database**
   - Create proper indexes
   - Monitor query performance
   - Implement pagination
   - Use aggregation pipelines

## 🎯 Next Steps

After successful deployment:

1. **Monitor and Analytics**

   - Set up application monitoring
   - Track user engagement
   - Monitor error rates

2. **SEO Optimization**

   - Implement meta tags
   - Add structured data
   - Create XML sitemap

3. **Advanced Features**

   - Implement caching strategies
   - Add real-time notifications
   - Enhance search with filters
   - Add content recommendations

4. **Security Enhancements**
   - Implement 2FA
   - Add content moderation
   - Enhance rate limiting
   - Add security headers

## 📞 Support

For deployment issues:

1. Check logs for error messages
2. Verify environment variables
3. Test API endpoints individually
4. Check third-party service status

---

**Happy Deploying! 🚀**
