import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs, removeBlog, featureBlog } from '../store/slices/blogSlice';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  FlagIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const BlogManagement = () => {
  const dispatch = useDispatch();
  const { blogs, pagination, loading } = useSelector((state) => state.blogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, blog: null });

  useEffect(() => {
    dispatch(fetchBlogs({
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

  const handleDeleteBlog = (blog) => {
    setDeleteModal({ isOpen: true, blog });
  };

  const confirmDelete = async () => {
    if (deleteModal.blog) {
      await dispatch(removeBlog(deleteModal.blog._id));
      setDeleteModal({ isOpen: false, blog: null });
    }
  };

  const handleFeatureBlog = async (blogId) => {
    await dispatch(featureBlog(blogId));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="badge badge-success">Published</span>;
      case 'draft':
        return <span className="badge badge-warning">Draft</span>;
      case 'archived':
        return <span className="badge badge-ghost">Archived</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-base-content">Blog Management</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Blogs</div>
              <div className="stat-value text-primary">{pagination?.totalBlogs || 0}</div>
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
                placeholder="Search blogs by title or content..."
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
              onClick={() => handleStatusFilter('published')}
              className={`btn btn-sm ${statusFilter === 'published' ? 'btn-primary' : 'btn-outline'}`}
            >
              Published
            </button>
            <button
              onClick={() => handleStatusFilter('draft')}
              className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-primary' : 'btn-outline'}`}
            >
              Draft
            </button>
            <button
              onClick={() => handleStatusFilter('reported')}
              className={`btn btn-sm ${statusFilter === 'reported' ? 'btn-primary' : 'btn-outline'}`}
            >
              Reported
            </button>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
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
                  <th>Blog</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Engagement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs?.map((blog) => (
                  <tr key={blog._id} className="hover:bg-base-200">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            {blog.coverImage ? (
                              <img src={blog.coverImage} alt={blog.title} />
                            ) : (
                              <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                                <DocumentTextIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold max-w-xs truncate">{blog.title}</div>
                          <div className="text-sm opacity-50 flex items-center space-x-2">
                            {blog.isFeatured && (
                              <StarSolid className="w-4 h-4 text-yellow-500" />
                            )}
                            {blog.isReported && (
                              <FlagIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span>{blog.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            {blog.author?.profilePic ? (
                              <img src={blog.author.profilePic} alt={blog.author.name} />
                            ) : (
                              <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                                <span className="text-xs">{blog.author?.name?.[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{blog.author?.name}</div>
                          <div className="text-sm opacity-50">{blog.author?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(blog.status)}</td>
                    <td>
                      {blog.publishedAt ? 
                        format(new Date(blog.publishedAt), 'MMM dd, yyyy') :
                        'Not published'
                      }
                    </td>
                    <td>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{blog.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{blog.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>{blog.commentCount || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <Link 
                          to={`/blogs/${blog._id}`}
                          className="btn btn-sm btn-ghost"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleFeatureBlog(blog._id)}
                          className={`btn btn-sm ${
                            blog.isFeatured ? 'btn-warning' : 'btn-outline'
                          }`}
                        >
                          {blog.isFeatured ? (
                            <StarSolid className="w-4 h-4" />
                          ) : (
                            <StarIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="btn btn-sm btn-error"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
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

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Blog</h3>
            <p className="py-4">
              Are you sure you want to delete "{deleteModal.blog?.title}"? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteModal({ isOpen: false, blog: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDelete}
              >
                Delete Blog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
