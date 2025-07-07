import React from 'react';
import { 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon,
  LinkIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/date';

const ProfileHeader = ({ user, onEditProfile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <img
            src={user?.profilePic || '/default-avatar.png'}
            alt={user?.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex items-center space-x-1">
                  <AtSymbolIcon className="h-4 w-4" />
                  <span>{user?.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onEditProfile}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.followerCount || 0}
              </span>
              <span>followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.followingCount || 0}
              </span>
              <span>following</span>
            </div>
            {user?.isVerified && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
