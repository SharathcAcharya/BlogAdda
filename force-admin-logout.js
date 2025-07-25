// Force Admin Auth Reset - Run this in Browser Console on Admin Page
console.log('🔄 Clearing admin authentication...');

// Clear all localStorage items
localStorage.clear();

// Clear specific items that might be cached
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('admin-token');
localStorage.removeItem('admin-user');
localStorage.removeItem('persist:admin-auth');
localStorage.removeItem('persist:root');

// Clear sessionStorage too
sessionStorage.clear();

// Clear all cookies for this domain
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ All authentication data cleared');
console.log('🔄 Reloading page...');

// Force reload
setTimeout(() => {
    window.location.reload();
}, 1000);
