import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportedComments, removeComment } from '../store/slices/commentSlice';
import { 
  TrashIcon,
  EyeIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const CommentManagement = () => {
  const dispatch = useDispatch();
  const { comments, pagination, loading } = useSelector((state) => state.comments);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, comment: null });

  useEffect(() => {
    dispatch(fetchReportedComments({
      page: currentPage,
      limit: 20
    }));
  }, [dispatch, currentPage]);

  const handleDeleteComment = (comment) => {
    setDeleteModal({ isOpen: true, comment });
  };

  const confirmDelete = async () => {
    if (deleteModal.comment) {
      await dispatch(removeComment(deleteModal.comment._id));
      setDeleteModal({ isOpen: false, comment: null });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-base-content">Comment Management</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Reported Comments</div>
              <div className="stat-value text-warning">{pagination?.totalComments || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="alert alert-warning">
        <ExclamationTriangleIcon className="w-6 h-6" />
        <span>This page shows only reported comments that need moderation attention.</span>
      </div>

      {/* Comments Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : comments?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">No Reported Comments</h3>
            <p className="text-base-content/70">All comments are clean! No moderation needed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Comment</th>
                  <th>Author</th>
                  <th>Blog</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments?.map((comment) => (
                  <tr key={comment._id} className="hover:bg-base-200">
                    <td>
                      <div className="max-w-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <FlagIcon className="w-4 h-4 text-red-500" />
                          <span className="badge badge-error badge-sm">Reported</span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {truncateContent(comment.content)}
                        </p>
                        <p className="text-xs text-base-content/70">
                          {comment.content.length} characters
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            {comment.author?.profilePic ? (
                              <img src={comment.author.profilePic} alt={comment.author.name} />
                            ) : (
                              <div className="bg-primary text-white flex items-center justify-center w-full h-full">
                                <span className="text-xs">{comment.author?.name?.[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{comment.author?.name}</div>
                          <div className="text-sm opacity-50">{comment.author?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{comment.blog?.title}</div>
                        <div className="text-sm opacity-50">{comment.blog?.slug}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                        <div className="text-xs opacity-50">
                          {format(new Date(comment.createdAt), 'h:mm a')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/blog/${comment.blog?.slug}`, '_blank')}
                          className="btn btn-sm btn-ghost"
                          title="View blog"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment)}
                          className="btn btn-sm btn-error"
                          title="Delete comment"
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
            <h3 className="font-bold text-lg">Delete Comment</h3>
            <div className="py-4">
              <p className="mb-2">Are you sure you want to delete this comment?</p>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Comment by {deleteModal.comment?.author?.name}:</p>
                <p className="text-sm italic">"{deleteModal.comment?.content}"</p>
              </div>
              <p className="text-sm text-base-content/70 mt-2">
                This action cannot be undone. The comment will be replaced with a moderation notice.
              </p>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteModal({ isOpen: false, comment: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDelete}
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
