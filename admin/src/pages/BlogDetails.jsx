import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogDetails, removeBlog, featureBlog } from '../store/slices/blogSlice';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  TrashIcon,
  FlagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const BlogDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBlog, loading } = useSelector((state) => state.blogs);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogDetails(id));
    }
  }, [dispatch, id]);

  const handleFeatureBlog = async () => {
    if (currentBlog) {
      await dispatch(featureBlog(currentBlog._id));
    }
  };

  const handleDeleteBlog = async () => {
    if (currentBlog && window.confirm('Are you sure you want to delete this blog?')) {
      await dispatch(removeBlog(currentBlog._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationTriangleIcon className="w-16 h-16 text-base-content/30 mb-4" />
        <h3 className="text-lg font-medium text-base-content mb-2">Blog Not Found</h3>
        <p className="text-base-content/70">The blog you're looking for doesn't exist.</p>
        <Link to="/blogs" className="btn btn-primary mt-4">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/blogs" className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>
          <h1 className="text-2xl font-bold text-base-content">Blog Details</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleFeatureBlog}
            className={`btn ${currentBlog.isFeatured ? 'btn-warning' : 'btn-outline'}`}
          >
            {currentBlog.isFeatured ? (
              <StarSolid className="w-4 h-4 mr-2" />
            ) : (
              <StarIcon className="w-4 h-4 mr-2" />
            )}
            {currentBlog.isFeatured ? 'Unfeature' : 'Feature'}
          </button>
          <button
            onClick={handleDeleteBlog}
            className="btn btn-error"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            {currentBlog.isFeatured && (
              <span className="badge badge-warning">
                <StarSolid className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
            {currentBlog.isReported && (
              <span className="badge badge-error">
                <FlagIcon className="w-3 h-3 mr-1" />
                Reported
              </span>
            )}
            <span className={`badge ${
              currentBlog.status === 'published' ? 'badge-success' :
              currentBlog.status === 'draft' ? 'badge-warning' :
              'badge-ghost'
            }`}>
              {currentBlog.status}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">{currentBlog.title}</h2>
          
          <div className="flex items-center space-x-6 text-base-content/70 mb-6">
            <div className="flex items-center space-x-2">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  {currentBlog.author?.profilePic ? (
                    <img src={currentBlog.author.profilePic} alt={currentBlog.author.name} />
                  ) : (
                    <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                      <span className="text-xs">{currentBlog.author?.name?.[0]}</span>
                    </div>
                  )}
                </div>
              </div>
              <span>{currentBlog.author?.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{currentBlog.views || 0} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="w-4 h-4" />
              <span>{currentBlog.likeCount || 0} likes</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>{currentBlog.commentCount || 0} comments</span>
            </div>
          </div>

          {currentBlog.coverImage && (
            <img 
              src={currentBlog.coverImage} 
              alt={currentBlog.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentBlog.content }} />
          </div>
        </div>
      </div>

      {/* Blog Metadata */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Blog Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Created
            </label>
            <p className="text-sm text-base-content/70">
              {format(new Date(currentBlog.createdAt), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Published
            </label>
            <p className="text-sm text-base-content/70">
              {currentBlog.publishedAt ? 
                format(new Date(currentBlog.publishedAt), 'MMMM dd, yyyy h:mm a') :
                'Not published'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Last Updated
            </label>
            <p className="text-sm text-base-content/70">
              {format(new Date(currentBlog.updatedAt), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Read Time
            </label>
            <p className="text-sm text-base-content/70">
              {currentBlog.readTime || 0} minutes
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Blog ID
            </label>
            <p className="text-sm text-base-content/70 font-mono">
              {currentBlog._id}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Slug
            </label>
            <p className="text-sm text-base-content/70 font-mono">
              {currentBlog.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {currentBlog.tags && currentBlog.tags.length > 0 && (
        <div className="bg-base-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {currentBlog.tags.map((tag, index) => (
              <span key={index} className="badge badge-outline">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
