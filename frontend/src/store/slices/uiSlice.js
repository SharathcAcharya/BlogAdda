import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Modals
  showLoginModal: false,
  showRegisterModal: false,
  showSearchModal: false,
  showDeleteConfirmModal: false,
  deleteConfirmData: null,
  
  // Sidebar
  sidebarOpen: false,
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Loading states
  globalLoading: false,
  
  // Toast notifications
  toasts: [],
  
  // Mobile menu
  mobileMenuOpen: false,
  
  // Search
  searchQuery: '',
  searchFilters: {
    category: '',
    tags: [],
    sortBy: 'relevance',
  },
  
  // Pagination
  currentPage: 1,
  
  // Infinite scroll
  hasMore: true,
  
  // Error handling
  errorMessage: null,
  
  // Feature flags
  features: {
    darkMode: true,
    notifications: true,
    realTimeUpdates: true,
    pushNotifications: false,
  },
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modalType, data } = action.payload;
      switch (modalType) {
        case 'login':
          state.showLoginModal = true;
          break;
        case 'register':
          state.showRegisterModal = true;
          break;
        case 'search':
          state.showSearchModal = true;
          break;
        case 'deleteConfirm':
          state.showDeleteConfirmModal = true;
          state.deleteConfirmData = data;
          break;
        default:
          break;
      }
    },
    
    closeModal: (state, action) => {
      const modalType = action.payload;
      switch (modalType) {
        case 'login':
          state.showLoginModal = false;
          break;
        case 'register':
          state.showRegisterModal = false;
          break;
        case 'search':
          state.showSearchModal = false;
          break;
        case 'deleteConfirm':
          state.showDeleteConfirmModal = false;
          state.deleteConfirmData = null;
          break;
        case 'all':
          state.showLoginModal = false;
          state.showRegisterModal = false;
          state.showSearchModal = false;
          state.showDeleteConfirmModal = false;
          state.deleteConfirmData = null;
          break;
        default:
          break;
      }
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: 'info',
        duration: 4000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Mobile menu actions
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchFilters = initialState.searchFilters;
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    resetPagination: (state) => {
      state.currentPage = 1;
    },
    
    // Infinite scroll actions
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    
    // Error handling
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    
    clearErrorMessage: (state) => {
      state.errorMessage = null;
    },
    
    // Feature flags
    toggleFeature: (state, action) => {
      const featureName = action.payload;
      if (state.features.hasOwnProperty(featureName)) {
        state.features[featureName] = !state.features[featureName];
      }
    },
    
    setFeature: (state, action) => {
      const { featureName, enabled } = action.payload;
      if (state.features.hasOwnProperty(featureName)) {
        state.features[featureName] = enabled;
      }
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme
        features: state.features, // Preserve feature flags
      };
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setGlobalLoading,
  addToast,
  removeToast,
  clearToasts,
  toggleMobileMenu,
  setMobileMenuOpen,
  setSearchQuery,
  setSearchFilters,
  clearSearch,
  setCurrentPage,
  resetPagination,
  setHasMore,
  setErrorMessage,
  clearErrorMessage,
  toggleFeature,
  setFeature,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
