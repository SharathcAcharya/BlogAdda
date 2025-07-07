import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnalyticsAPI from '../services/analyticsAPI';

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await AnalyticsAPI.getUserAnalytics('30d');
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view your analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your content performance and audience engagement
          </p>
        </div>

        {/* User Stats Summary */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Content Overview (Last 30 Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg inline-flex mb-2">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.summary.totalBlogs}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Blogs</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg inline-flex mb-2">
                  <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.summary.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg inline-flex mb-2">
                  <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.summary.totalLikes.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg inline-flex mb-2">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.summary.totalComments.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
              </div>
            </div>

            {/* Top Performing Blogs */}
            {userStats.blogPerformance && userStats.blogPerformance.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Top Performing Blogs
                </h3>
                <div className="space-y-3">
                  {userStats.blogPerformance.slice(0, 5).map((blog, index) => (
                    <div key={blog._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {blog.title}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Analytics Dashboard */}
        <AnalyticsDashboard 
          userId={user.id} 
          isAdmin={user.role === 'admin'} 
        />

        {/* Tips and Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Tips to Improve Your Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Increase Engagement
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use compelling titles and featured images</li>
                <li>• Engage with comments on your posts</li>
                <li>• Share your content on social media</li>
                <li>• Write about trending topics in your niche</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Optimize Content
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Analyze your top-performing content</li>
                <li>• Post consistently to build audience</li>
                <li>• Use relevant tags and categories</li>
                <li>• Create content your audience wants</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
