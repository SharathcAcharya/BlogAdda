# 🔍 Advanced Search Implementation Guide

## Overview

Implement a powerful search system using Algolia for instant, typo-tolerant search with filters and facets.

## Installation

```bash
cd frontend
npm install algoliasearch react-instantsearch-hooks-web
```

## Backend Integration

### 1. Algolia Setup (backend/services/SearchService.js)

```javascript
const algoliasearch = require("algoliasearch");
const Blog = require("../models/Blog");

class SearchService {
  constructor() {
    this.client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
    );
    this.index = this.client.initIndex("blogs");
  }

  async indexBlog(blog) {
    const record = {
      objectID: blog._id.toString(),
      title: blog.title,
      content: this.stripHtml(blog.content),
      excerpt: blog.excerpt,
      author: blog.author.name,
      authorId: blog.author._id.toString(),
      tags: blog.tags,
      category: blog.category,
      createdAt: blog.createdAt.getTime(),
      views: blog.views,
      likeCount: blog.likes.length,
      commentCount: blog.commentCount,
      readingTime: blog.readingTime,
      isFeatured: blog.isFeatured,
      status: blog.status,
    };

    try {
      await this.index.saveObject(record);
      console.log(`Blog ${blog._id} indexed successfully`);
    } catch (error) {
      console.error("Error indexing blog:", error);
    }
  }

  async updateBlog(blog) {
    await this.indexBlog(blog);
  }

  async deleteBlog(blogId) {
    try {
      await this.index.deleteObject(blogId.toString());
      console.log(`Blog ${blogId} removed from index`);
    } catch (error) {
      console.error("Error removing blog from index:", error);
    }
  }

  async bulkIndex() {
    try {
      const blogs = await Blog.find({ status: "published" })
        .populate("author", "name")
        .lean();

      const records = blogs.map((blog) => ({
        objectID: blog._id.toString(),
        title: blog.title,
        content: this.stripHtml(blog.content),
        excerpt: blog.excerpt,
        author: blog.author.name,
        authorId: blog.author._id.toString(),
        tags: blog.tags,
        category: blog.category,
        createdAt: blog.createdAt.getTime(),
        views: blog.views || 0,
        likeCount: blog.likes?.length || 0,
        readingTime: blog.readingTime || 1,
        isFeatured: blog.isFeatured || false,
        status: blog.status,
      }));

      await this.index.saveObjects(records);
      console.log(`${records.length} blogs indexed successfully`);
    } catch (error) {
      console.error("Error bulk indexing blogs:", error);
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, "").substring(0, 1000);
  }

  async configureIndex() {
    await this.index.setSettings({
      searchableAttributes: [
        "title",
        "content",
        "excerpt",
        "tags",
        "author",
        "category",
      ],
      attributesForFaceting: ["category", "tags", "author", "isFeatured"],
      customRanking: ["desc(views)", "desc(likeCount)", "desc(createdAt)"],
      ranking: [
        "typo",
        "geo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom",
      ],
    });
  }
}

module.exports = new SearchService();
```

### 2. Update Blog Routes (backend/routes/blogs.js)

```javascript
const searchService = require("../services/SearchService");

// Add after blog creation
router.post("/", protect, async (req, res) => {
  try {
    // ... existing blog creation code ...

    // Index the blog for search
    await searchService.indexBlog(savedBlog);

    res.status(201).json({
      success: true,
      data: { blog: savedBlog },
    });
  } catch (error) {
    // ... error handling ...
  }
});

// Add after blog update
router.put("/:id", protect, async (req, res) => {
  try {
    // ... existing blog update code ...

    // Update search index
    await searchService.updateBlog(updatedBlog);

    res.json({
      success: true,
      data: { blog: updatedBlog },
    });
  } catch (error) {
    // ... error handling ...
  }
});

// Add after blog deletion
router.delete("/:id", protect, async (req, res) => {
  try {
    // ... existing blog deletion code ...

    // Remove from search index
    await searchService.deleteBlog(req.params.id);

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    // ... error handling ...
  }
});
```

## Frontend Implementation

### 1. Algolia Client (frontend/src/lib/algolia.js)

```javascript
import algoliasearch from "algoliasearch/lite";

export const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY
);

export const BLOGS_INDEX = "blogs";
```

### 2. Advanced Search Component (frontend/src/components/search/AdvancedSearch.jsx)

```jsx
import React from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Configure,
  Stats,
  SortBy,
  Pagination,
  ClearRefinements,
  CurrentRefinements,
  RangeInput,
  ToggleRefinement,
} from "react-instantsearch-hooks-web";
import { searchClient, BLOGS_INDEX } from "../../lib/algolia";
import BlogSearchHit from "./BlogSearchHit";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

const AdvancedSearch = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <InstantSearch searchClient={searchClient} indexName={BLOGS_INDEX}>
        <Configure hitsPerPage={12} />

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search Blogs
          </h1>

          {/* Search Box */}
          <div className="relative max-w-2xl">
            <SearchBox
              placeholder="Search for blogs, authors, or topics..."
              className="w-full"
              classNames={{
                root: "relative",
                form: "relative",
                input:
                  "w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                submitIcon: "hidden",
                resetIcon: "hidden",
                submit: "absolute left-3 top-1/2 transform -translate-y-1/2",
                reset: "absolute right-3 top-1/2 transform -translate-y-1/2",
              }}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>

          {/* Search Stats */}
          <div className="mt-4">
            <Stats
              classNames={{
                root: "text-sm text-gray-600 dark:text-gray-400",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Clear Filters */}
              <div className="mb-4">
                <ClearRefinements
                  classNames={{
                    root: "w-full",
                    button:
                      "w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
                    disabledButton: "opacity-50 cursor-not-allowed",
                  }}
                />
              </div>

              {/* Current Refinements */}
              <div className="mb-4">
                <CurrentRefinements
                  classNames={{
                    root: "space-y-2",
                    list: "space-y-1",
                    item: "flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg",
                    label:
                      "text-sm font-medium text-blue-900 dark:text-blue-200",
                    category: "text-xs text-blue-700 dark:text-blue-300",
                    delete:
                      "ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200",
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Category
                </h4>
                <RefinementList
                  attribute="category"
                  limit={10}
                  showMore={true}
                  classNames={{
                    root: "space-y-2",
                    list: "space-y-1",
                    item: "flex items-center",
                    label:
                      "flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    checkbox:
                      "mr-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full",
                  }}
                />
              </div>

              {/* Tags Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Tags
                </h4>
                <RefinementList
                  attribute="tags"
                  limit={8}
                  showMore={true}
                  classNames={{
                    root: "space-y-2",
                    list: "space-y-1",
                    item: "flex items-center",
                    label:
                      "flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    checkbox:
                      "mr-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full",
                  }}
                />
              </div>

              {/* Author Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Author
                </h4>
                <RefinementList
                  attribute="author"
                  limit={6}
                  showMore={true}
                  classNames={{
                    root: "space-y-2",
                    list: "space-y-1",
                    item: "flex items-center",
                    label:
                      "flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    checkbox:
                      "mr-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500",
                    labelText: "flex-1",
                    count:
                      "ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full",
                  }}
                />
              </div>

              {/* Featured Toggle */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Featured Content
                </h4>
                <ToggleRefinement
                  attribute="isFeatured"
                  classNames={{
                    root: "flex items-center",
                    label:
                      "flex items-center cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    checkbox:
                      "mr-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500",
                    labelText: "flex-1",
                  }}
                />
              </div>

              {/* Reading Time Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Reading Time (minutes)
                </h4>
                <RangeInput
                  attribute="readingTime"
                  classNames={{
                    root: "space-y-3",
                    form: "flex items-center space-x-2",
                    input:
                      "w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm",
                    separator: "text-gray-500 dark:text-gray-400",
                    submit:
                      "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <SortBy
                  items={[
                    { label: "Most Relevant", value: "blogs" },
                    { label: "Most Recent", value: "blogs_date_desc" },
                    { label: "Most Popular", value: "blogs_popularity_desc" },
                    { label: "Most Liked", value: "blogs_likes_desc" },
                  ]}
                  classNames={{
                    root: "relative",
                    select:
                      "appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  }}
                />
              </div>
            </div>

            {/* Search Results */}
            <Hits
              hitComponent={BlogSearchHit}
              classNames={{
                root: "space-y-6",
                list: "space-y-6",
                item: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow",
              }}
            />

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <Pagination
                classNames={{
                  root: "flex items-center space-x-2",
                  list: "flex items-center space-x-2",
                  item: "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  selectedItem: "px-3 py-2 rounded-lg bg-blue-600 text-white",
                  disabledItem:
                    "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
                  link: "block",
                }}
              />
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default AdvancedSearch;
```

### 3. Search Hit Component (frontend/src/components/search/BlogSearchHit.jsx)

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Highlight } from "react-instantsearch-hooks-web";
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/date";

const BlogSearchHit = ({ hit }) => {
  return (
    <article className="p-6">
      <div className="flex items-start space-x-4">
        {/* Blog Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            <Link
              to={`/blog/${hit.slug || hit.objectID}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Highlight attribute="title" hit={hit} />
            </Link>
          </h3>

          {/* Author & Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <span>By</span>
              <Highlight
                attribute="author"
                hit={hit}
                classNames={{
                  highlighted: "bg-yellow-200 dark:bg-yellow-800 px-1 rounded",
                }}
              />
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(hit.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{hit.readingTime} min read</span>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            <Highlight
              attribute="content"
              hit={hit}
              classNames={{
                highlighted: "bg-yellow-200 dark:bg-yellow-800 px-1 rounded",
              }}
            />
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hit.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                <Highlight
                  attribute="tags"
                  hit={{ ...hit, tags: [tag] }}
                  classNames={{
                    highlighted:
                      "bg-yellow-200 dark:bg-yellow-800 px-1 rounded",
                  }}
                />
              </span>
            ))}
            {hit.tags?.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{hit.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{hit.views?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-4 w-4" />
              <span>{hit.likeCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{hit.commentCount || 0}</span>
            </div>
            {hit.isFeatured && (
              <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                <StarIcon className="h-4 w-4 fill-current" />
                <span>Featured</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 capitalize">
            {hit.category}
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogSearchHit;
```

### 4. Quick Search Component (frontend/src/components/search/QuickSearch.jsx)

```jsx
import React, { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
} from "react-instantsearch-hooks-web";
import { searchClient, BLOGS_INDEX } from "../../lib/algolia";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const QuickSearchHit = ({ hit }) => (
  <Link
    to={`/blog/${hit.slug || hit.objectID}`}
    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
  >
    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
      {hit.title}
    </h4>
    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
      {hit.excerpt || hit.content?.substring(0, 100)}...
    </p>
    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
      <span>{hit.author}</span>
      <span className="mx-2">•</span>
      <span>{hit.category}</span>
    </div>
  </Link>
);

const QuickSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          <InstantSearch searchClient={searchClient} indexName={BLOGS_INDEX}>
            <Configure hitsPerPage={8} />

            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <SearchBox
                  placeholder="Search blogs, authors, or topics..."
                  autoFocus
                  classNames={{
                    root: "relative",
                    form: "relative",
                    input:
                      "w-full pl-12 pr-4 py-3 border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 text-lg",
                    submitIcon: "hidden",
                    resetIcon: "hidden",
                  }}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <Hits
                hitComponent={QuickSearchHit}
                classNames={{
                  root: "",
                  list: "",
                  item: "",
                }}
              />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <Link
                to="/search"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                onClick={onClose}
              >
                View all search results →
              </Link>
            </div>
          </InstantSearch>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
```

### 5. Environment Variables

```env
# Add to frontend/.env
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key

# Add to backend/.env
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
```

### 6. Integration with Header (frontend/src/components/layout/Header.jsx)

```jsx
import QuickSearch from "../search/QuickSearch";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header>
      {/* ... existing header content ... */}

      {/* Search Button */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {/* Quick Search Modal */}
      <QuickSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};
```

## Usage Instructions

1. **Setup Algolia Account**

   - Create account at algolia.com
   - Get App ID and API keys
   - Add environment variables

2. **Initial Index Setup**

   ```bash
   # Run this script to index existing blogs
   node backend/scripts/indexBlogs.js
   ```

3. **Add Search Route**

   ```jsx
   // In frontend/src/App.jsx
   <Route path="search" element={<AdvancedSearch />} />
   ```

4. **Configure Algolia Index**
   ```javascript
   // Run once to configure search settings
   const searchService = require("./backend/services/SearchService");
   searchService.configureIndex();
   ```

## Features Included

✅ **Instant Search** - Real-time search as you type  
✅ **Typo Tolerance** - Finds results even with spelling errors  
✅ **Faceted Search** - Filter by category, tags, author  
✅ **Sorting Options** - Relevance, date, popularity  
✅ **Highlighting** - Search terms highlighted in results  
✅ **Pagination** - Efficient result pagination  
✅ **Mobile Responsive** - Works perfectly on all devices  
✅ **Dark Mode Support** - Matches your app's theme

This search implementation will significantly improve user experience and content discoverability on your BlogAdda platform!
