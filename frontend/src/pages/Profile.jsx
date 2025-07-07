import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  UserIcon,
  PencilIcon,
  HeartIcon,
  BookmarkIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { fetchUserBlogs } from '../store/slices/blogSlice';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileEditor from '../components/profile/ProfileEditor';
import { formatDate } from '../utils/date';
import AnalyticsAPI from '../services/analyticsAPI';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userBlogs, loading } = useSelector((state) => state.blogs);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBlogs(user._id));
    }
  }, [dispatch, user]);

  // Analytics tracking
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await AnalyticsAPI.trackPageView('profile');
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader 
          user={user} 
          onEditProfile={() => setShowProfileEditor(true)} 
        />

        {/* Profile Stats */}
        <ProfileStats user={user} userBlogs={userBlogs || []} />

        {/* User's Stories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Stories
            </h2>
            <Button>
              <PencilIcon className="h-4 w-4 mr-2" />
              Write New Story
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : userBlogs && userBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} showActions />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <PencilIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No stories yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start sharing your thoughts and experiences with the world.
              </p>
              <Button>
                <PencilIcon className="h-4 w-4 mr-2" />
                Write Your First Story
              </Button>
            </div>
          )}
        </div>

        {/* Profile Editor Modal */}
        {showProfileEditor && (
          <ProfileEditor onClose={() => setShowProfileEditor(false)} />
        )}
      </div>
    </div>
  );
};

export default Profile;
