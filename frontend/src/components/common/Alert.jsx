import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const variants = {
    success: {
      containerClass: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      iconClass: 'text-green-400',
      titleClass: 'text-green-800 dark:text-green-200',
      messageClass: 'text-green-700 dark:text-green-300',
      Icon: CheckCircleIcon,
    },
    error: {
      containerClass: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      iconClass: 'text-red-400',
      titleClass: 'text-red-800 dark:text-red-200',
      messageClass: 'text-red-700 dark:text-red-300',
      Icon: XCircleIcon,
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      iconClass: 'text-yellow-400',
      titleClass: 'text-yellow-800 dark:text-yellow-200',
      messageClass: 'text-yellow-700 dark:text-yellow-300',
      Icon: ExclamationTriangleIcon,
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      iconClass: 'text-blue-400',
      titleClass: 'text-blue-800 dark:text-blue-200',
      messageClass: 'text-blue-700 dark:text-blue-300',
      Icon: InformationCircleIcon,
    },
  };

  const variant = variants[type];
  const { Icon } = variant;

  return (
    <div className={`border rounded-lg p-4 ${variant.containerClass} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${variant.iconClass}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${variant.titleClass}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`${title ? 'mt-2' : ''} text-sm ${variant.messageClass}`}>
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant.iconClass} hover:bg-black/5 dark:hover:bg-white/5`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
