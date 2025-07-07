import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-primary mb-4" />
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-base-content mb-4">Page Not Found</h2>
        <p className="text-base-content/70 mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-x-4">
          <Link to="/" className="btn btn-primary">
            <HomeIcon className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
