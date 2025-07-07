import React from 'react';
import { useSelector } from 'react-redux';
import { 
  ChartBarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Trending = () => {
  const { trendingBlogs, loading } = useSelector((state) => state.blogs);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FireIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Stories
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover the most popular and engaging stories on BlogAdda
          </p>
        </div>

        {/* Trending Categories */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 overflow-x-auto pb-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">
              <ChartBarIcon className="h-5 w-5" />
              <span>All Trending</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap">
              <ClockIcon className="h-5 w-5" />
              <span>This Week</span>
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap">
              Technology
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap">
              Lifestyle
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap">
              Travel
            </button>
          </div>
        </div>

        {/* Trending Blogs Grid */}
        {trendingBlogs && trendingBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingBlogs.map((blog, index) => (
              <div key={blog._id} className="relative">
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                )}
                <BlogCard blog={blog} variant="trending" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FireIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No trending stories yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later for the latest trending content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
