import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import SearchAPI from '../../services/searchAPI';
import LoadingSpinner from '../common/LoadingSpinner';

const AdvancedSearch = ({ 
  placeholder = "Search blogs, authors, topics...",
  showFilters = true,
  autoFocus = false,
  onResultSelect,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
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
  
  // Popular searches
  const [popularSearches, setPopularSearches] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Categories for filter
  const categories = [
    'technology', 'lifestyle', 'travel', 'food', 'health',
    'business', 'education', 'entertainment', 'sports',
    'politics', 'science', 'other'
  ];

  // Load popular searches on mount
  useEffect(() => {
    loadPopularSearches();
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, filters, 0);
      loadSuggestions(debouncedQuery);
    } else {
      setResults([]);
      setSuggestions([]);
      setShowResults(false);
    }
  }, [debouncedQuery, filters]);

  // Get URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlQuery = urlParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      setShowResults(true);
    }
  }, [location]);

  const loadPopularSearches = async () => {
    try {
      const response = await SearchAPI.getPopularSearches(8);
      if (response.success) {
        setPopularSearches(response.data);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  const loadSuggestions = async (searchQuery) => {
    try {
      const response = await SearchAPI.getSuggestions(searchQuery, 5);
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    }
  };

  const performSearch = async (searchQuery, searchFilters, page = 0) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await SearchAPI.search(searchQuery, searchFilters, page, 20);
      if (response.success) {
        const newResults = page === 0 ? response.data.hits : [...results, ...response.data.hits];
        setResults(newResults);
        setHasMore(response.data.page < response.data.nbPages - 1);
        setTotalResults(response.data.nbHits);
        setCurrentPage(page);
        setShowResults(true);
        
        // Update URL
        const params = new URLSearchParams({ q: searchQuery });
        navigate(`/search?${params.toString()}`, { replace: true });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = () => {
    if (!isSearching && hasMore) {
      performSearch(debouncedQuery, filters, currentPage + 1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, filters, 0);
      setShowFiltersPanel(false);
    }
  };

  const handleResultClick = (result) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      navigate(`/blog/${result.slug || result.objectID}`);
    }
    setShowResults(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handlePopularSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    performSearch(searchTerm, filters, 0);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    navigate('/search', { replace: true });
    searchInputRef.current?.focus();
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
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      tags: [],
      author: [],
      status: '',
      isFeatured: undefined,
      minViews: '',
      dateRange: { start: '', end: '' }
    });
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showFiltersPanel ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
              </button>
            )}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {(showResults || suggestions.length > 0 || popularSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Search Results */}
            {showResults && results.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                  {totalResults} results found
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {results.slice(0, 5).map((result) => (
                    <motion.div
                      key={result.objectID}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      onClick={() => handleResultClick(result)}
                      className="p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        {result.featuredImage && (
                          <img
                            src={result.featuredImage}
                            alt={result.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result._highlightResult?.title?.value ? (
                              <span dangerouslySetInnerHTML={{
                                __html: result._highlightResult.title.value
                              }} />
                            ) : result.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            by {result.author} • {result.category}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
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
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {results.length > 5 && (
                  <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all {totalResults} results
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && !showResults && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                  Suggestions
                </div>
                <div>
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion._highlightResult?.title?.value ? (
                          <span dangerouslySetInnerHTML={{
                            __html: suggestion._highlightResult.title.value
                          }} />
                        ) : suggestion.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && !query && (
              <div>
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                  <ClockIcon className="inline h-4 w-4 mr-1" />
                  Popular searches
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {isSearching && (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-16 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TagIcon className="inline h-4 w-4 mr-1" />
                  Categories
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() => updateFilter('category', category)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Minimum Views */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <EyeIcon className="inline h-4 w-4 mr-1" />
                  Minimum Views
                </label>
                <input
                  type="number"
                  value={filters.minViews}
                  onChange={(e) => updateFilter('minViews', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
                  placeholder="e.g., 100"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performSearch(query || debouncedQuery, filters, 0);
                  setShowFiltersPanel(false);
                }}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
