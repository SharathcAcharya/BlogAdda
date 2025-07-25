import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon,
  LinkIcon,
  UsersIcon,
  DocumentTextIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { fetchUserBlogs } from '../store/slices/blogSlice';
import userAPI from '../services/userAPI';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { formatDate } from '../utils/date';

const AuthorProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { userBlogs, loading: blogsLoading } = useSelector((state) => state.blogs);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalBlogs: 0,
    followers: 0
  });

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserById(id);
        setAuthor(response.data.user);
        
        // Fetch author's blogs
        dispatch(fetchUserBlogs({ userId: id }));
      } catch (error) {
        console.error('Error fetching author:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuthor();
    }
  }, [id, dispatch]);

  // Calculate stats from blogs
  useEffect(() => {
    if (userBlogs && userBlogs.length > 0) {
      const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0);
      
      setStats({
        totalViews,
        totalLikes,
        totalBlogs: userBlogs.length,
        followers: author?.followerCount || 0
      });
    }
  }, [userBlogs, author]);

  const handleFollow = async () => {
    try {
      await userAPI.followUser(id);
      setFollowing(!following);
      setStats(prev => ({
        ...prev,
        followers: following ? prev.followers - 1 : prev.followers + 1
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Author not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The author you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Author Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {author.profilePic ? (
                <img
                  src={author.profilePic}
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-white" />
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {author.name}
              </h1>
              
              {author.bio && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {author.bio}
                </p>
              )}

              {/* Author Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  Joined {formatDate(author.createdAt)}
                </div>
                
                {author.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {author.location}
                  </div>
                )}
                
                {author.website && (
                  <a 
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Website
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalBlogs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.followers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalLikes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                </div>
              </div>

              {/* Follow Button */}
              {currentUser && currentUser._id !== author._id && (
                <Button
                  onClick={handleFollow}
                  variant={following ? 'outline' : 'primary'}
                  className="flex items-center"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  {following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Author's Stories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Stories by {author.name}
          </h2>

          {blogsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : userBlogs && userBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No stories yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {author.name} hasn't published any stories yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
