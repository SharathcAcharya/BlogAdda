import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogs } from '../store/slices/blogSlice';

const DebugBlogs = () => {
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.blogs);

  useEffect(() => {
    console.log('DebugBlogs: Dispatching fetchBlogs');
    dispatch(fetchBlogs({ page: 1, limit: 12 }));
  }, [dispatch]);

  console.log('DebugBlogs - State:', { blogs, loading, error });
  console.log('DebugBlogs - Blogs array:', blogs);
  console.log('DebugBlogs - Blogs length:', blogs?.length);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h2>Debug Blogs Component</h2>
      <div>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Blogs Count:</strong> {blogs?.length || 0}</p>
      </div>
      
      {blogs && blogs.length > 0 ? (
        <div>
          <h3>Blogs Found:</h3>
          <ul>
            {blogs.map((blog, index) => (
              <li key={blog._id || index}>
                <strong>{blog.title}</strong> - {blog.category} - by {blog.author?.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No blogs found or blogs is null/undefined</p>
      )}
    </div>
  );
};

export default DebugBlogs;
