import api from './api';

// Get comments for a blog post
export const getComments = (blogId, page = 1, limit = 20) => {
  return api.get(`/blogs/${blogId}/comments?page=${page}&limit=${limit}`);
};

// Create a new comment
export const createComment = (blogId, content, parentId = null) => {
  return api.post(`/blogs/${blogId}/comments`, {
    content,
    parent: parentId
  });
};

// Update a comment
export const updateComment = (commentId, content) => {
  return api.put(`/blogs/comments/${commentId}`, {
    content
  });
};

// Delete a comment
export const deleteComment = (commentId) => {
  return api.delete(`/blogs/comments/${commentId}`);
};

// Like/unlike a comment
export const likeComment = (commentId) => {
  return api.post(`/blogs/comments/${commentId}/like`);
};

// Get replies for a comment
export const getReplies = (commentId, page = 1, limit = 10) => {
  return api.get(`/blogs/comments/${commentId}/replies?page=${page}&limit=${limit}`);
};
