import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUsers, getUserById, toggleUserBan } from '../../services/adminAPI';
import toast from 'react-hot-toast';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users.'
      );
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserById(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user details.'
      );
    }
  }
);

export const banUser = createAsyncThunk(
  'users/banUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await toggleUserBan(userId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user ban status.'
      );
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Ban User
      .addCase(banUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in the users list
        const index = state.users.findIndex(user => user._id === action.payload.user.id);
        if (index !== -1) {
          state.users[index].isBanned = action.payload.user.isBanned;
          state.users[index].banReason = action.payload.user.banReason;
        }
        
        // Update in the current user if viewing user details
        if (state.currentUser && state.currentUser._id === action.payload.user.id) {
          state.currentUser.isBanned = action.payload.user.isBanned;
          state.currentUser.banReason = action.payload.user.banReason;
        }
        
        toast.success(action.payload.message);
      })
      .addCase(banUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, clearCurrentUser } = userSlice.actions;

export default userSlice.reducer;
