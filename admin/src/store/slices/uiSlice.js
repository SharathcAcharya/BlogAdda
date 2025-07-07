import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: localStorage.getItem('admin-theme') || 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('admin-theme', newTheme);
      state.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    setTheme: (state, action) => {
      localStorage.setItem('admin-theme', action.payload);
      state.theme = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleTheme, setTheme } = uiSlice.actions;

export default uiSlice.reducer;
