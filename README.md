# � BlogAdda - Complete Modern Blogging Platform

A full-fledged blogging platform with advanced features, real-time functionality, and modern UI/UX.

## � Quick Start

### 1. Prerequisites

- **Node.js** (v18+)
- **npm** (v9+)
- **Git**

### 2. Installation

```bash
# Clone and setup
git clone https://github.com/yourusername/blogadda.git
cd blogadda

# Quick automated setup
node quick-setup.js

# OR Manual setup
npm run install-all
npm run seed
npm run build
```

### 3. Environment Setup

Copy `.env.example` to `.env` in each directory and update with your credentials:

#### Backend (.env)

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_ADMIN_API_KEY=your-algolia-admin-api-key
ALGOLIA_SEARCH_API_KEY=your-algolia-search-api-key
```

#### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5000/api
VITE_ALGOLIA_APP_ID=your-algolia-app-id
VITE_ALGOLIA_SEARCH_API_KEY=your-algolia-search-api-key
```

### 4. Start Development

```bash
npm run dev
```

### 5. Access Your Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **Backend API**: http://localhost:5000

## 🎯 Key Features

### ✅ Fully Implemented

- **Advanced Search** with Algolia integration
- **Progressive Web App** (PWA) capabilities
- **Admin Panel** with comprehensive management
- **Real-time Analytics** dashboard
- **AI Content Assistant** for writing help
- **User Authentication** with JWT
- **Blog Management** with rich editor
- **Comment System** with moderation
- **Email Notifications** system
- **SEO Optimization** features
- **Mobile-responsive** design
- **Dark/Light Mode** toggle

## 🏗️ Tech Stack

### Frontend

- React.js + Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Framer Motion

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary for media

### Admin

- React Admin Dashboard
- Role-based Access Control

## 📁 Project Structure

```
BlogAdda/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── admin/             # Admin dashboard
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- Git

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd BlogAdda
```

2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin
cd ../admin
npm install
```

3. Environment Setup

```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Start development servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev

# Admin (Terminal 3)
cd admin
npm run dev
```

## 🌐 Deployment

- **Frontend**: Vercel/Netlify
- **Backend**: Render/Railway/AWS EC2
- **Database**: MongoDB Atlas
- **Domain**: blogadda.live

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email support@blogadda.live or join our Discord server.
