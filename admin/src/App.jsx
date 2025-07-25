import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import BlogManagement from './pages/BlogManagement';
import CommentManagement from './pages/CommentManagement';
import UserDetails from './pages/UserDetails';
import BlogDetails from './pages/BlogDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
    </div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="mb-4">You don't have permission to access the admin area.</p>
      <a href="/" className="btn btn-primary">Go to Homepage</a>
    </div>;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Force check authentication on app start
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto"></div>
          <p className="text-white mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show only login routes
  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated but not admin/moderator, show access denied
  if (user && user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access the admin area.</p>
        <p className="text-sm text-gray-600 mb-6">Your role: {user.role}</p>
        <div className="space-x-4">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Logout & Try Again
          </button>
          <a 
            href="http://localhost:3000" 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="blogs" element={<BlogManagement />} />
        <Route path="blogs/:id" element={<BlogDetails />} />
        <Route path="comments" element={<CommentManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
