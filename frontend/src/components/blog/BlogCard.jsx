import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon as HeartOutline, 
  ChatBubbleLeftIcon,
  BookmarkIcon as BookmarkOutline,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { formatDate, formatReadTime } from '../../utils/date';
import { truncateText } from '../../utils/helpers';
import { likeBlog, bookmarkBlog } from '../../store/slices/blogSlice';

const BlogCard = ({ blog, variant = 'default' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const isLiked = blog.likes?.includes(user?._id);
  const isBookmarked = blog.bookmarks?.includes(user?._id);

  const handleLike = async (e) => {
    e.preventDefault();
    if (user) {
      dispatch(likeBlog(blog._id));
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (user) {
      dispatch(bookmarkBlog(blog._id));
    }
  };

  if (variant === 'featured') {
    return (
      <Link to={`/blog/${blog.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {blog.featuredImage && (
            <div className="relative h-64 sm:h-80">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Categories */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                  {blog.category}
                </span>
              </div>
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-gray-200 text-sm line-clamp-2 mb-4">
                  {truncateText(blog.excerpt || blog.content, 120)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={blog.author.avatar || '/default-avatar.png'}
                      alt={blog.author.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <div>
                      <p className="font-medium text-sm">{blog.author.name}</p>
                      <p className="text-xs text-gray-300">
                        {formatDate(blog.createdAt)} • {formatReadTime(blog.readTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{blog.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HeartOutline className="h-4 w-4" />
                      <span>{blog.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </Link>
    );
  }

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:-translate-y-2 transition-all duration-300 card-hover">
      <Link to={`/blog/${blog.slug}`} className="block">
        {blog.featuredImage && (
          <div className="relative h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <TagIcon className="h-3 w-3 mr-1" />
                {blog.category || 'General'}
              </span>
            </div>
            
            {/* Read time badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-black/20 backdrop-blur-sm text-white">
                <ClockIcon className="h-3 w-3 mr-1" />
                {formatReadTime(blog.readTime)}
              </span>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <EyeIcon className="h-4 w-4" />
            <span>{blog.views || 0} views</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {blog.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 leading-relaxed">
            {truncateText(blog.excerpt || blog.content, 150)}
          </p>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={blog.author.avatar || '/default-avatar.png'}
                  alt={blog.author.name}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors duration-200"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {blog.author.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{blog.author.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-sm font-medium mr-1">Read more</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
      
      {/* Enhanced Action buttons */}
      <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`group/like flex items-center space-x-2 text-sm transition-all duration-200 ${
              isLiked 
                ? 'text-red-600 dark:text-red-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500'
            }`}
          >
            <div className="relative">
              {isLiked ? (
                <HeartSolid className="h-5 w-5 animate-pulse" />
              ) : (
                <HeartOutline className="h-5 w-5 group-hover/like:scale-110 transition-transform duration-200" />
              )}
            </div>
            <span className="font-medium">{blog.likes?.length || 0}</span>
          </button>
          
          <Link
            to={`/blog/${blog.slug}#comments`}
            className="group/comment flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 group-hover/comment:scale-110 transition-transform duration-200" />
            <span className="font-medium">{blog.comments?.length || 0}</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <EyeIcon className="h-5 w-5" />
            <span className="font-medium">{blog.views || 0}</span>
          </div>
        </div>
        
        <button
          onClick={handleBookmark}
          className={`group/bookmark p-2 rounded-full transition-all duration-200 ${
            isBookmarked
              ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
              : 'text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          {isBookmarked ? (
            <BookmarkSolid className="h-5 w-5 animate-pulse" />
          ) : (
            <BookmarkOutline className="h-5 w-5 group-hover/bookmark:scale-110 transition-transform duration-200" />
          )}
        </button>
      </div>
    </article>
  );
};

export default BlogCard;
