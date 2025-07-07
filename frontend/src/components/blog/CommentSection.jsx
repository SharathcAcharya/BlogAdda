import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { fetchComments, addComment } from '../../store/slices/commentSlice';
import CommentItem from './CommentItem';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';

const CommentSection = ({ blogId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { commentsByBlog, loading, submitting } = useSelector((state) => state.comments);
  
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const blogComments = commentsByBlog[blogId] || { comments: [], loading: false, hasMore: true, page: 1 };
  const comments = blogComments.comments || [];

  useEffect(() => {
    if (blogId && comments.length === 0) {
      dispatch(fetchComments({ blogId, page: 1 }));
    }
  }, [dispatch, blogId, comments.length]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await dispatch(addComment({
        blogId,
        content: newComment.trim()
      })).unwrap();
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleLoadMore = () => {
    if (blogComments.hasMore && !blogComments.loading) {
      dispatch(fetchComments({ 
        blogId, 
        page: blogComments.page + 1 
      }));
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex space-x-3">
            <img
              src={user.profilePic || '/default-avatar.png'}
              alt={user.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                rows="3"
              />
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {newComment.length}/1000 characters
                </div>
                <Button 
                  type="submit" 
                  loading={submitting}
                  disabled={!newComment.trim() || newComment.length > 1000}
                  size="sm"
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Join the conversation! Share your thoughts on this post.
          </p>
          <Button variant="outline" size="sm">
            Sign In to Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      {blogComments.loading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {displayedComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={(reply) => {
                // Handle reply addition
                console.log('Reply added:', reply);
              }}
            />
          ))}

          {/* Show More/Less Comments */}
          {comments.length > 5 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {showAllComments 
                  ? 'Show Less Comments' 
                  : `Show ${comments.length - 5} More Comments`
                }
              </button>
            </div>
          )}

          {/* Load More */}
          {blogComments.hasMore && showAllComments && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                loading={blogComments.loading}
                variant="outline"
                size="sm"
              >
                Load More Comments
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No comments yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Be the first to share your thoughts on this post!
          </p>
          {!user && (
            <Button variant="outline" size="sm">
              Sign In to Comment
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
