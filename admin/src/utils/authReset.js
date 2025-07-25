// Admin Authentication Reset Utility
// Run this in browser console to clear all authentication data

const clearAdminAuth = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('persist:admin-auth');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies for this domain
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('✅ Admin authentication data cleared');
  console.log('🔄 Please refresh the page to see login screen');
  
  // Force reload
  window.location.reload();
};

// Auto-execute if in development
if (window.location.hostname === 'localhost') {
  console.log('🔧 Admin auth reset utility loaded');
  console.log('Run clearAdminAuth() to force logout');
}

export default clearAdminAuth;
