import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails, banUser } from '../store/slices/userSlice';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  UsersIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const UserDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.users);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
  }, [dispatch, id]);

  const handleBanUser = async (reason) => {
    if (currentUser) {
      await dispatch(banUser({ userId: currentUser._id, reason }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ExclamationTriangleIcon className="w-16 h-16 text-base-content/30 mb-4" />
        <h3 className="text-lg font-medium text-base-content mb-2">User Not Found</h3>
        <p className="text-base-content/70">The user you're looking for doesn't exist.</p>
        <Link to="/users" className="btn btn-primary mt-4">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/users" className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-base-content">User Details</h1>
        </div>
        <div className="flex space-x-2">
          {currentUser.role !== 'admin' && (
            <button
              onClick={() => handleBanUser(currentUser.isBanned ? '' : 'Admin action')}
              className={`btn ${currentUser.isBanned ? 'btn-success' : 'btn-error'}`}
            >
              {currentUser.isBanned ? 'Unban User' : 'Ban User'}
            </button>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full">
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} alt={currentUser.name} />
                ) : (
                  <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <span className={`badge ${
                currentUser.role === 'admin' ? 'badge-error' :
                currentUser.role === 'moderator' ? 'badge-warning' :
                'badge-ghost'
              }`}>
                {currentUser.role}
              </span>
              {currentUser.isBanned ? (
                <span className="badge badge-error">
                  <XCircleIcon className="w-3 h-3 mr-1" />
                  Banned
                </span>
              ) : (
                <span className="badge badge-success">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Active
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-base-content/70">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-base-content/70">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {format(new Date(currentUser.createdAt), 'MMMM dd, yyyy')}</span>
              </div>
              {currentUser.lastLogin && (
                <div className="flex items-center space-x-2 text-base-content/70">
                  <EyeIcon className="w-4 h-4" />
                  <span>Last seen {format(new Date(currentUser.lastLogin), 'MMMM dd, yyyy')}</span>
                </div>
              )}
            </div>
            
            {currentUser.bio && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-base-content/80">{currentUser.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ban Info */}
      {currentUser.isBanned && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-error" />
            <h3 className="font-medium text-error">User is currently banned</h3>
          </div>
          {currentUser.banReason && (
            <p className="text-sm text-base-content/70">
              <strong>Reason:</strong> {currentUser.banReason}
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow-md rounded-lg">
          <div className="stat-figure text-primary">
            <DocumentTextIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Blog Posts</div>
          <div className="stat-value text-primary">{currentUser.blogCount || 0}</div>
          <div className="stat-desc">Total published blogs</div>
        </div>

        <div className="stat bg-base-100 shadow-md rounded-lg">
          <div className="stat-figure text-secondary">
            <UsersIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Followers</div>
          <div className="stat-value text-secondary">{currentUser.followerCount || 0}</div>
          <div className="stat-desc">People following this user</div>
        </div>

        <div className="stat bg-base-100 shadow-md rounded-lg">
          <div className="stat-figure text-accent">
            <UsersIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Following</div>
          <div className="stat-value text-accent">{currentUser.followingCount || 0}</div>
          <div className="stat-desc">Users being followed</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Account Status
            </label>
            <p className="text-sm text-base-content/70">
              {currentUser.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Email Verified
            </label>
            <p className="text-sm text-base-content/70">
              {currentUser.isEmailVerified ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Profile Visibility
            </label>
            <p className="text-sm text-base-content/70">
              {currentUser.isPublic ? 'Public' : 'Private'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              User ID
            </label>
            <p className="text-sm text-base-content/70 font-mono">
              {currentUser._id}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {currentUser.recentBlogs?.length > 0 ? (
            currentUser.recentBlogs.map((blog) => (
              <div key={blog._id} className="flex items-center space-x-4 p-3 bg-base-200 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{blog.title}</p>
                  <p className="text-sm text-base-content/70">
                    Published {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <Link to={`/blogs/${blog._id}`} className="btn btn-sm btn-ghost">
                  View
                </Link>
              </div>
            ))
          ) : (
            <p className="text-base-content/70">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
