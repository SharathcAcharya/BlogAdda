import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers, banUser } from '../store/slices/userSlice';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [banModal, setBanModal] = useState({ isOpen: false, user: null });
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm,
      status: statusFilter
    }));
  }, [dispatch, currentPage, searchTerm, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleBanUser = (user) => {
    setBanModal({ isOpen: true, user });
  };

  const confirmBan = async () => {
    if (banModal.user) {
      await dispatch(banUser({
        userId: banModal.user._id,
        reason: banReason
      }));
      setBanModal({ isOpen: false, user: null });
      setBanReason('');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-base-content">User Management</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{pagination?.totalUsers || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter('banned')}
              className={`btn btn-sm ${statusFilter === 'banned' ? 'btn-primary' : 'btn-outline'}`}
            >
              Banned
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user._id} className="hover:bg-base-200">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.name} />
                            ) : (
                              <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                                <UserIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-50">
                            {user.lastLogin ? 
                              `Last seen ${format(new Date(user.lastLogin), 'MMM dd, yyyy')}` :
                              'Never logged in'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'badge-error' :
                        user.role === 'moderator' ? 'badge-warning' :
                        'badge-ghost'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {user.isBanned ? (
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
                    </td>
                    <td>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="text-sm">
                        <div>{user.blogCount || 0} blogs</div>
                        <div>{user.followerCount || 0} followers</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <Link 
                          to={`/users/${user._id}`}
                          className="btn btn-sm btn-ghost"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleBanUser(user)}
                            className={`btn btn-sm ${
                              user.isBanned ? 'btn-success' : 'btn-error'
                            }`}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button
              className="join-item btn"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index}
                className={`join-item btn ${
                  currentPage === index + 1 ? 'btn-active' : ''
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="join-item btn"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModal.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {banModal.user?.isBanned ? 'Unban User' : 'Ban User'}
            </h3>
            <p className="py-4">
              Are you sure you want to {banModal.user?.isBanned ? 'unban' : 'ban'} {banModal.user?.name}?
            </p>
            {!banModal.user?.isBanned && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason for ban</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Enter reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setBanModal({ isOpen: false, user: null })}
              >
                Cancel
              </button>
              <button
                className={`btn ${banModal.user?.isBanned ? 'btn-success' : 'btn-error'}`}
                onClick={confirmBan}
              >
                {banModal.user?.isBanned ? 'Unban' : 'Ban'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
