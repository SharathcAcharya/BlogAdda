import React from 'react';
import { useSelector } from 'react-redux';

const RequireRole = ({ children, allowedRoles = [], fallback = null }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to access this content.
        </p>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">
          You don't have permission to access this content.
        </p>
      </div>
    );
  }

  return children;
};

export default RequireRole;
