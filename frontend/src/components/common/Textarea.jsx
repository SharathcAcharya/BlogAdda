import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label, 
  error, 
  helperText,
  rows = 4,
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block border rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-vertical';
  const normalClasses = 'border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';
  const errorClasses = 'border-red-300 focus:ring-red-500 dark:border-red-500';
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          ${baseClasses}
          ${error ? errorClasses : normalClasses}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
