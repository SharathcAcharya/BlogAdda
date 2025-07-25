import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  TagIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { fetchBlogs } from '../store/slices/blogSlice';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Categories = () => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blogs);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { name: 'all', label: 'All Categories', icon: SparklesIcon, count: 0 },
    { name: 'technology', label: 'Technology', icon: ChartBarIcon, count: 0 },
    { name: 'lifestyle', label: 'Lifestyle', icon: UserGroupIcon, count: 0 },
    { name: 'travel', label: 'Travel', icon: TagIcon, count: 0 },
    { name: 'food', label: 'Food', icon: TagIcon, count: 0 },
    { name: 'health', label: 'Health', icon: TagIcon, count: 0 },
    { name: 'business', label: 'Business', icon: TagIcon, count: 0 },
    { name: 'education', label: 'Education', icon: TagIcon, count: 0 },
    { name: 'entertainment', label: 'Entertainment', icon: TagIcon, count: 0 },
    { name: 'sports', label: 'Sports', icon: TagIcon, count: 0 },
    { name: 'science', label: 'Science', icon: TagIcon, count: 0 }
  ];

  useEffect(() => {
    dispatch(fetchBlogs({ page: 1, limit: 50 }));
  }, [dispatch]);

  // Filter blogs by category
  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs?.filter(blog => blog.category === selectedCategory);

  // Calculate category counts
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: category.name === 'all' 
      ? blogs?.length || 0 
      : blogs?.filter(blog => blog.category === category.name).length || 0
  }));

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover stories by category and find your interests
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesWithCounts.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{category.label}</h3>
                  <p className="text-xs opacity-60">{category.count} stories</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedCategory === 'all' ? 'All Stories' : 
             categoriesWithCounts.find(c => c.name === selectedCategory)?.label || selectedCategory}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredBlogs?.length || 0} stories found
          </p>
        </div>

        {/* Blog Grid */}
        {filteredBlogs && filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No stories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There are no stories in this category yet.
            </p>
            <Link
              to="/write"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TagIcon className="h-5 w-5 mr-2" />
              Be the first to write
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
