import React from 'react';
import { 
  UserIcon, 
  PencilIcon, 
  HeartIcon, 
  EyeIcon,
  CalendarIcon,
  BookmarkIcon 
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/date';

const ProfileStats = ({ user, userBlogs = [] }) => {
  const totalViews = userBlogs.reduce((total, blog) => total + (blog.views || 0), 0);
  const totalLikes = userBlogs.reduce((total, blog) => total + (blog.likeCount || 0), 0);
  const totalComments = userBlogs.reduce((total, blog) => total + (blog.commentCount || 0), 0);

  const stats = [
    {
      icon: PencilIcon,
      label: 'Stories',
      value: userBlogs.length,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: EyeIcon,
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: HeartIcon,
      label: 'Total Likes',
      value: totalLikes.toLocaleString(),
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900'
    },
    {
      icon: BookmarkIcon,
      label: 'Followers',
      value: user?.followerCount || 0,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
