import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import userAPI from '../services/userAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        // For now, we'll extract unique authors from blogs
        // In a real app, you'd have a dedicated authors endpoint
        const response = await fetch('http://localhost:5000/api/blogs?page=1&limit=50');
        const data = await response.json();
        
        if (data.success) {
          const uniqueAuthors = [];
          const authorIds = new Set();
          
          data.data.blogs.forEach(blog => {
            if (!authorIds.has(blog.author._id)) {
              authorIds.add(blog.author._id);
              uniqueAuthors.push({
                ...blog.author,
                blogCount: data.data.blogs.filter(b => b.author._id === blog.author._id).length,
                totalViews: data.data.blogs
                  .filter(b => b.author._id === blog.author._id)
                  .reduce((sum, b) => sum + (b.views || 0), 0),
                totalLikes: data.data.blogs
                  .filter(b => b.author._id === blog.author._id)
                  .reduce((sum, b) => sum + (b.likeCount || 0), 0)
              });
            }
          });
          
          setAuthors(uniqueAuthors);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.bio && author.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Featured Authors
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover talented writers and their amazing stories
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Authors Grid */}
        {filteredAuthors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuthors.map((author) => (
              <Link
                key={author._id}
                to={`/author/${author._id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105">
                  {/* Author Avatar */}
                  <div className="flex items-center space-x-4 mb-4">
                    {author.profilePic ? (
                      <img
                        src={author.profilePic}
                        alt={author.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {author.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>Featured Author</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {author.bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {author.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {author.blogCount || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Stories
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {author.totalViews?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Views
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {author.followerCount || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Followers
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No authors found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'No authors available yet.'}
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Become a Featured Author
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Share your stories and join our community of talented writers
          </p>
          <Link
            to="/write"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Start Writing Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Authors;
