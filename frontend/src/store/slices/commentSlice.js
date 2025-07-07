import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as commentAPI from '../../services/commentAPI';

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ blogId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await commentAPI.getComments(blogId, page);
      return { ...response.data, blogId, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ blogId, content, parentId = null }, { getState, rejectWithValue }) => {
    try {
      const response = await commentAPI.createComment(blogId, content, parentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await commentAPI.updateComment(commentId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentAPI.deleteComment(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await commentAPI.likeComment(commentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
    }
  }
);

const initialState = {
  commentsByBlog: {}, // { blogId: { comments: [], loading: false, error: null, hasMore: true, page: 1 } }
  loading: false,
  error: null,
  submitting: false
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state, action) => {
      const blogId = action.payload;
      if (blogId) {
        delete state.commentsByBlog[blogId];
      } else {
        state.commentsByBlog = {};
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setCommentSubmitting: (state, action) => {
      state.submitting = action.payload;
    },
    updateCommentInList: (state, action) => {
      const comment = action.payload;
      Object.keys(state.commentsByBlog).forEach(blogId => {
        const blogComments = state.commentsByBlog[blogId];
        const index = blogComments.comments.findIndex(c => c._id === comment._id);
        if (index !== -1) {
          blogComments.comments[index] = comment;
        }
      });
    },
    removeCommentFromList: (state, action) => {
      const commentId = action.payload;
      Object.keys(state.commentsByBlog).forEach(blogId => {
        const blogComments = state.commentsByBlog[blogId];
        blogComments.comments = blogComments.comments.filter(c => c._id !== commentId);
      });
    },
    addReplyToComment: (state, action) => {
      const { parentId, reply } = action.payload;
      Object.keys(state.commentsByBlog).forEach(blogId => {
        const blogComments = state.commentsByBlog[blogId];
        const parentIndex = blogComments.comments.findIndex(c => c._id === parentId);
        if (parentIndex !== -1) {
          if (!blogComments.comments[parentIndex].replies) {
            blogComments.comments[parentIndex].replies = [];
          }
          blogComments.comments[parentIndex].replies.unshift(reply);
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state, action) => {
        const blogId = action.meta.arg.blogId;
        if (!state.commentsByBlog[blogId]) {
          state.commentsByBlog[blogId] = {
            comments: [],
            loading: false,
            error: null,
            hasMore: true,
            page: 1
          };
        }
        state.commentsByBlog[blogId].loading = true;
        state.commentsByBlog[blogId].error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { comments, hasMore, page, blogId } = action.payload;
        const blogComments = state.commentsByBlog[blogId];
        
        blogComments.loading = false;
        if (page === 1) {
          blogComments.comments = comments;
        } else {
          blogComments.comments = [...blogComments.comments, ...comments];
        }
        blogComments.hasMore = hasMore;
        blogComments.page = page;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const blogId = action.meta.arg.blogId;
        if (state.commentsByBlog[blogId]) {
          state.commentsByBlog[blogId].loading = false;
          state.commentsByBlog[blogId].error = action.payload;
        }
      })
      
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.submitting = false;
        const comment = action.payload;
        const blogId = comment.blog;
        
        if (state.commentsByBlog[blogId]) {
          if (comment.parent) {
            // It's a reply
            const parentIndex = state.commentsByBlog[blogId].comments.findIndex(
              c => c._id === comment.parent
            );
            if (parentIndex !== -1) {
              if (!state.commentsByBlog[blogId].comments[parentIndex].replies) {
                state.commentsByBlog[blogId].comments[parentIndex].replies = [];
              }
              state.commentsByBlog[blogId].comments[parentIndex].replies.unshift(comment);
            }
          } else {
            // It's a top-level comment
            state.commentsByBlog[blogId].comments.unshift(comment);
          }
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const comment = action.payload;
        Object.keys(state.commentsByBlog).forEach(blogId => {
          const blogComments = state.commentsByBlog[blogId];
          const index = blogComments.comments.findIndex(c => c._id === comment._id);
          if (index !== -1) {
            blogComments.comments[index] = comment;
          } else {
            // Check replies
            blogComments.comments.forEach(c => {
              if (c.replies) {
                const replyIndex = c.replies.findIndex(r => r._id === comment._id);
                if (replyIndex !== -1) {
                  c.replies[replyIndex] = comment;
                }
              }
            });
          }
        });
      })
      
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        Object.keys(state.commentsByBlog).forEach(blogId => {
          const blogComments = state.commentsByBlog[blogId];
          
          // Remove from top-level comments
          blogComments.comments = blogComments.comments.filter(c => c._id !== commentId);
          
          // Remove from replies
          blogComments.comments.forEach(c => {
            if (c.replies) {
              c.replies = c.replies.filter(r => r._id !== commentId);
            }
          });
        });
      })
      
      // Like comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const comment = action.payload;
        Object.keys(state.commentsByBlog).forEach(blogId => {
          const blogComments = state.commentsByBlog[blogId];
          const index = blogComments.comments.findIndex(c => c._id === comment._id);
          if (index !== -1) {
            blogComments.comments[index] = comment;
          } else {
            // Check replies
            blogComments.comments.forEach(c => {
              if (c.replies) {
                const replyIndex = c.replies.findIndex(r => r._id === comment._id);
                if (replyIndex !== -1) {
                  c.replies[replyIndex] = comment;
                }
              }
            });
          }
        });
      });
  }
});

export const {
  clearComments,
  clearError,
  setCommentSubmitting,
  updateCommentInList,
  removeCommentFromList,
  addReplyToComment
} = commentSlice.actions;

export default commentSlice.reducer;
