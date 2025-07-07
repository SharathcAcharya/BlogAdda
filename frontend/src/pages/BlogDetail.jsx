import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CalendarIcon, 
  UserIcon, 
  EyeIcon, 
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { fetchBlogBySlug, likeBlog, bookmarkBlog } from '../store/slices/blogSlice';
import { fetchComments, addComment } from '../store/slices/commentSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { formatDate } from '../utils/date';
import { toast } from 'react-hot-toast';
import AnalyticsAPI from '../services/analyticsAPI';

const BlogDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentBlog, loading } = useSelector((state) => state.blogs);
  const { comments, loading: commentsLoading } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);

  const [comment, setComment] = React.useState('');
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogBySlug(slug));
      dispatch(fetchComments(slug));
    }
  }, [dispatch, slug]);

  // Track blog view when blog is loaded
  useEffect(() => {
    if (currentBlog && currentBlog._id) {
      AnalyticsAPI.trackBlogView(currentBlog._id, {
        title: currentBlog.title,
        author: currentBlog.author?.name,
        category: currentBlog.category
      });
    }
  }, [currentBlog]);

  useEffect(() => {
    if (currentBlog && user) {
      setIsLiked(currentBlog.likes?.includes(user._id));
      setIsBookmarked(currentBlog.bookmarks?.includes(user._id));
    }
  }, [currentBlog, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      await dispatch(likeBlog(currentBlog._id)).unwrap();
      setIsLiked(!isLiked);
      
      // Track like event
      if (!isLiked) {
        AnalyticsAPI.trackBlogLike(currentBlog._id, {
          title: currentBlog.title,
          author: currentBlog.author?.name
        });
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark posts');
      return;
    }
    
    try {
      await dispatch(bookmarkBlog(currentBlog._id)).unwrap();
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      toast.error('Failed to bookmark post');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await dispatch(addComment({ 
        blogId: currentBlog._id, 
        content: comment 
      })).unwrap();
      setComment('');
      
      // Track comment event
      AnalyticsAPI.trackComment(currentBlog._id, {
        title: currentBlog.title,
        commentLength: comment.length
      });
      
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = () => {
    // Track share event
    AnalyticsAPI.trackBlogShare(currentBlog._id, 'native_share', {
      title: currentBlog.title,
      method: navigator.share ? 'native' : 'clipboard'
    });
    
    if (navigator.share) {
      navigator.share({
        title: currentBlog.title,
        text: currentBlog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blog Header */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {currentBlog.featuredImage && (
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              <img
                src={currentBlog.featuredImage}
                alt={currentBlog.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Category */}
            {currentBlog.category && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  {currentBlog.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {currentBlog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <img
                  src={currentBlog.author?.avatar || '/default-avatar.png'}
                  alt={currentBlog.author?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{currentBlog.author?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(currentBlog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>{currentBlog.views || 0} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-100' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{currentBlog.likeCount || 0}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-100' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="h-5 w-5" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
                <span>Bookmark</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{currentBlog.content}</div>
            </div>

            {/* Tags */}
            {currentBlog.tags && currentBlog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentBlog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({comments?.length || 0})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex space-x-4">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button type="submit" loading={commentsLoading}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Please <button className="text-blue-600 hover:underline">login</button> to post a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-4">
                  <img
                    src={comment.author?.avatar || '/default-avatar.png'}
                    alt={comment.author?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.author?.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
