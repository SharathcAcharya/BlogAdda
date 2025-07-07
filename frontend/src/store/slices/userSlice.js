import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userAPI from '../../services/userAPI';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserProfile(userId);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.followUser(userId);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to follow user'
      );
    }
  }
);

export const fetchUserFollowers = createAsyncThunk(
  'users/fetchUserFollowers',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserFollowers(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch followers'
      );
    }
  }
);

export const fetchUserFollowing = createAsyncThunk(
  'users/fetchUserFollowing',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserFollowing(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch following'
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await userAPI.searchUsers(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Initial state
const initialState = {
  currentProfile: null,
  followers: [],
  following: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
  followersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalFollowers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  followingPagination: {
    currentPage: 1,
    totalPages: 1,
    totalFollowing: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  searchPagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = initialState.searchPagination;
    },
    updateUserInList: (state, action) => {
      const { userId, updates } = action.payload;
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(user => user._id === userId);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = { ...state.searchResults[searchIndex], ...updates };
      }
      
      // Update in followers
      const followerIndex = state.followers.findIndex(user => user._id === userId);
      if (followerIndex !== -1) {
        state.followers[followerIndex] = { ...state.followers[followerIndex], ...updates };
      }
      
      // Update in following
      const followingIndex = state.following.findIndex(user => user._id === userId);
      if (followingIndex !== -1) {
        state.following[followingIndex] = { ...state.following[followingIndex], ...updates };
      }
      
      // Update current profile if it matches
      if (state.currentProfile && state.currentProfile._id === userId) {
        state.currentProfile = { ...state.currentProfile, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProfile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId, isFollowing, followerCount } = action.payload;
        
        // Update current profile if it matches
        if (state.currentProfile && state.currentProfile._id === userId) {
          state.currentProfile.isFollowing = isFollowing;
          state.currentProfile.followerCount = followerCount;
        }
        
        // Update in search results
        const searchIndex = state.searchResults.findIndex(user => user._id === userId);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex].isFollowing = isFollowing;
          state.searchResults[searchIndex].followerCount = followerCount;
        }
      })
      
      // Fetch User Followers
      .addCase(fetchUserFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload.followers;
        state.followersPagination = action.payload.pagination;
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Following
      .addCase(fetchUserFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload.following;
        state.followingPagination = action.payload.pagination;
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.users;
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentProfile,
  clearSearchResults,
  updateUserInList,
} = userSlice.actions;

export default userSlice.reducer;
