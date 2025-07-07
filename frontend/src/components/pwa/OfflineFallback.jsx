import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BookOpenIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);
  const [cachedBlogs, setCachedBlogs] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached blogs from localStorage or service worker cache
    loadCachedContent();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedContent = async () => {
    try {
      // Try to get cached blogs from localStorage first
      const cached = localStorage.getItem('cached-blogs');
      if (cached) {
        setCachedBlogs(JSON.parse(cached).slice(0, 5));
      }

      // If service worker is available, try to get from cache
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        const blogCache = cacheNames.find(name => name.includes('api-blogs'));
        
        if (blogCache) {
          const cache = await caches.open(blogCache);
          const requests = await cache.keys();
          const blogRequests = requests.filter(req => req.url.includes('/api/blogs'));
          
          if (blogRequests.length > 0) {
            const response = await cache.match(blogRequests[0]);
            const data = await response.json();
            if (data.success && data.data) {
              setCachedBlogs(data.data.slice(0, 5));
            }
          }
        }
      }
    } catch (error) {
      console.log('Could not load cached content:', error);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    
    // Wait a moment then check connection
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setRetrying(false);
      }
    }, 1000);
  };

  if (isOnline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Offline Icon */}
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Title and Description */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You're Offline
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No internet connection detected. Some features may not be available, but you can still browse cached content below.
          </p>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6 flex items-center justify-center"
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Checking Connection...' : 'Try Again'}
          </button>

          {/* Cached Content */}
          {cachedBlogs.length > 0 && (
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Available Offline
              </h3>
              <div className="space-y-3">
                {cachedBlogs.map((blog, index) => (
                  <motion.div
                    key={blog._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      // Navigate to cached blog if possible
                      window.location.href = `/blog/${blog.slug || blog._id}`;
                    }}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                      {blog.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>by {blog.author?.name || 'Unknown'}</span>
                      <div className="flex items-center space-x-3">
                        {blog.views && (
                          <span className="flex items-center">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {blog.views}
                          </span>
                        )}
                        {blog.likeCount && (
                          <span className="flex items-center">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            {blog.likeCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Cached Content */}
          {cachedBlogs.length === 0 && (
            <div className="text-center py-6">
              <WifiIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No offline content available. Please check your connection and try again.
              </p>
            </div>
          )}

          {/* Connection Info */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> When you're back online, content will be automatically cached for offline reading.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflineFallback;
