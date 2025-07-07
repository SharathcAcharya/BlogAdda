import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getCurrentUser } from './store/slices/authSlice';
import { useTheme } from './contexts/ThemeContext';
import initializeAOS from './utils/aos';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Write from './pages/Write';
import BlogDetail from './pages/BlogDetail';
import Trending from './pages/Trending';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import SearchResults from './pages/SearchResults';
import Analytics from './pages/Analytics';
import AnimationDemo from './pages/AnimationDemo';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// PWA Components
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import PWAUpdateNotifier from './components/pwa/PWAUpdateNotifier';

function App() {
  const dispatch = useDispatch();
  const { user, loading, token } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize AOS
    initializeAOS();
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Set CSS variables for toast styling
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--toast-bg', '#374151');
      root.style.setProperty('--toast-color', '#f9fafb');
      root.style.setProperty('--toast-border', '#4b5563');
    } else {
      root.style.setProperty('--toast-bg', '#ffffff');
      root.style.setProperty('--toast-color', '#1f2937');
      root.style.setProperty('--toast-border', '#e5e7eb');
    }
  }, [theme]);

  useEffect(() => {
    // Get current user if token exists
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="App">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            {/* Auth Routes - redirect if logged in */}
            <Route 
              path="login" 
              element={user ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route 
              path="register" 
              element={user ? <Navigate to="/" replace /> : <Register />} 
            />
            
            {/* Protected Routes - require authentication */}
            <Route 
              path="write" 
              element={user ? <Write /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="profile" 
              element={user ? <Profile /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="bookmarks" 
              element={user ? <Bookmarks /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="analytics" 
              element={user ? <Analytics /> : <Navigate to="/login" replace />} 
            />
            
            {/* Public Routes */}
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="trending" element={<Trending />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="animations" element={<AnimationDemo />} />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-600 dark:text-gray-400">Page not found</p>
                  </div>
                </div>
              } 
            />
          </Route>
        </Routes>
        
        {/* PWA Components */}
        <PWAInstallPrompt />
        <PWAUpdateNotifier />
      </ErrorBoundary>
    </div>
  );
}

export default App;
