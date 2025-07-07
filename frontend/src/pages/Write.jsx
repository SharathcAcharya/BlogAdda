import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  PhotoIcon, 
  TagIcon,
  EyeIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import AIContentAssistant from '../components/ai/AIContentAssistant';
import { createBlog } from '../store/slices/blogSlice';
import AnalyticsAPI from '../services/analyticsAPI';

const Write = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: null,
  });
  const [isPreview, setIsPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);

  // Analytics tracking
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await AnalyticsAPI.trackPageView('write');
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        featuredImage: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const blogData = new FormData();
      blogData.append('title', formData.title.trim());
      blogData.append('content', formData.content.trim());
      blogData.append('excerpt', formData.excerpt.trim() || formData.content.substring(0, 200) + '...');
      blogData.append('category', formData.category.trim() || 'General');
      blogData.append('tags', formData.tags.trim());
      
      if (formData.featuredImage) {
        blogData.append('featuredImage', formData.featuredImage);
      }

      await dispatch(createBlog(blogData)).unwrap();
      toast.success('Blog published successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to publish blog');
    }
  };

  const handleContentUpdate = (newContent) => {
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
    toast.success('Content updated with AI enhancement!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to write
          </h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Write a New Story
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your thoughts, experiences, and insights with the world.
          </p>
        </div>

        {/* Toggle Preview and AI Assistant */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isPreview
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 inline mr-2" />
              Write
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreview
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <EyeIcon className="h-5 w-5 inline mr-2" />
              Preview
            </button>
          </div>
          
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAIAssistant
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800'
            }`}
          >
            <SparklesIcon className="h-5 w-5 inline mr-2" />
            AI Assistant
          </button>
        </div>

        {!isPreview ? (
          /* Write Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, featuredImage: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Write an engaging title..."
                fullWidth
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Textarea
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tell your story..."
                rows={15}
                fullWidth
                required
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Textarea
                label="Excerpt (Optional)"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief summary of your story (will be auto-generated if left empty)..."
                rows={3}
                fullWidth
                helperText="This will appear in blog previews and search results"
              />
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Lifestyle, Travel"
                  fullWidth
                />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Input
                  label="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., javascript, react, programming"
                  icon={TagIcon}
                  fullWidth
                  helperText="Separate tags with commas"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Publish Story
              </Button>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {imagePreview && (
              <div className="h-64 bg-gray-200 dark:bg-gray-700">
                <img
                  src={imagePreview}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <div className="mb-4">
                {formData.category && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {formData.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {formData.title || 'Your Story Title'}
              </h1>
              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user?.name}</span>
                </div>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {formData.content ? (
                  <div className="whitespace-pre-wrap">
                    {formData.content}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Your story content will appear here...
                  </p>
                )}
              </div>
              {formData.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* AI Content Assistant */}
        {showAIAssistant && (
          <div className="mt-8">
            <AIContentAssistant
              content={formData.content}
              title={formData.title}
              onContentUpdate={handleContentUpdate}
              isVisible={showAIAssistant}
              onToggle={() => setShowAIAssistant(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Write;
