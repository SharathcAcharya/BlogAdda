import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import SearchAPI from '../services/searchAPI';
import AnalyticsAPI from '../services/analyticsAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BlogCard from '../components/blog/BlogCard';
import AdvancedSearch from '../components/search/AdvancedSearch';
import { formatDistanceToNow } from 'date-fns';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    category: [],
    tags: [],
    author: [],
    status: '',
    isFeatured: undefined,
    minViews: '',
    dateRange: { start: '', end: '' }
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery, filters, 0);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery, searchFilters, page = 0) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await SearchAPI.search(searchQuery, searchFilters, page, 20);
      if (response.success) {
        const newResults = page === 0 ? response.data.hits : [...results, ...response.data.hits];
        setResults(newResults);
        setFacets(response.data.facets || {});
        setHasMore(response.data.page < response.data.nbPages - 1);
        setTotalResults(response.data.nbHits);
        setCurrentPage(page);
        setProcessingTime(response.data.processingTimeMS);
        
        // Track search analytics only for new searches (page 0)
        if (page === 0) {
          AnalyticsAPI.trackSearch(searchQuery, response.data.nbHits, {
            filters: searchFilters,
            processingTime: response.data.processingTimeMS
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, filters, currentPage + 1);
    }
  };

  const updateFilter = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'category' || filterType === 'tags' || filterType === 'author') {
        const currentValues = newFilters[filterType];
        if (currentValues.includes(value)) {
          newFilters[filterType] = currentValues.filter(v => v !== value);
        } else {
          newFilters[filterType] = [...currentValues, value];
        }
      } else {
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
    
    // Trigger new search
    performSearch(query, filters, 0);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: [],
      tags: [],
      author: [],
      status: '',
      isFeatured: undefined,
      minViews: '',
      dateRange: { start: '', end: '' }
    };
    setFilters(clearedFilters);
    performSearch(query, clearedFilters, 0);
  };

  const handleResultClick = (result) => {
    navigate(`/blog/${result.slug || result.objectID}`);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likeCount - a.likeCount;
      case 'comments':
        return b.commentCount - a.commentCount;
      default:
        return 0; // Keep original relevance order
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 max-w-2xl">
              <AdvancedSearch
                placeholder="Search blogs, authors, topics..."
                autoFocus={!query}
                className="w-full"
              />
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-6 flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar with Filters */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Clear all
                </button>
              </div>

              {/* Categories Filter */}
              {facets.category && Object.keys(facets.category).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(facets.category).map(([category, count]) => (
                      <label key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category)}
                            onChange={() => updateFilter('category', category)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors Filter */}
              {facets.author && Object.keys(facets.author).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Authors
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(facets.author).slice(0, 10).map(([author, count]) => (
                      <label key={author} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.author.includes(author)}
                            onChange={() => updateFilter('author', author)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                            {author}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {facets.tags && Object.keys(facets.tags).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {Object.entries(facets.tags).slice(0, 20).map(([tag, count]) => (
                      <button
                        key={tag}
                        onClick={() => updateFilter('tags', tag)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Sort by
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Newest first</option>
                  <option value="views">Most viewed</option>
                  <option value="likes">Most liked</option>
                  <option value="comments">Most commented</option>
                </select>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:mt-0 mt-6">
            {/* Results Header */}
            {query && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Search Results for "{query}"
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {totalResults.toLocaleString()} results found in {processingTime}ms
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && results.length === 0 && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* No Results */}
            {!isLoading && results.length === 0 && query && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear filters and try again
                </button>
              </div>
            )}

            {/* Results Grid/List */}
            {sortedResults.length > 0 && (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                    : 'space-y-6'
                }`}>
                  {sortedResults.map((result, index) => (
                    <motion.div
                      key={result.objectID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleResultClick(result)}
                      className="cursor-pointer group"
                    >
                      {viewMode === 'grid' ? (
                        <BlogCard blog={result} showAuthor={true} />
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                          <div className="flex space-x-4">
                            {result.featuredImage && (
                              <img
                                src={result.featuredImage}
                                alt={result.title}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                {result._highlightResult?.title?.value ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: result._highlightResult.title.value
                                  }} />
                                ) : result.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                by {result.author} • {result.category} • {formatDistanceToNow(new Date(result.createdAt))} ago
                              </p>
                              {result._snippetResult?.content?.value && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                  <span dangerouslySetInnerHTML={{
                                    __html: result._snippetResult.content.value
                                  }} />
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <EyeIcon className="h-3 w-3" />
                                  <span>{result.views}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <HeartIcon className="h-3 w-3" />
                                  <span>{result.likeCount}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <ChatBubbleLeftIcon className="h-3 w-3" />
                                  <span>{result.commentCount}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{result.readingTime} min read</span>
                                </span>
                              </div>
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {result.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
