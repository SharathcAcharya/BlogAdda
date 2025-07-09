const algoliasearch = require("algoliasearch");
const Blog = require("../models/Blog");

class SearchService {
  constructor() {
    // Check if Algolia credentials are configured
    if (!process.env.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID === 'your-algolia-app-id') {
      console.log('⚠️  Algolia not configured - Search features will be disabled');
      console.log('ℹ️  To enable search: Set up Algolia account and update .env file');
      this.client = null;
      this.index = null;
      return;
    }

    if (!process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_API_KEY === 'your-algolia-admin-api-key') {
      console.log('⚠️  Algolia admin API key not configured - Search features will be disabled');
      this.client = null;
      this.index = null;
      return;
    }

    try {
      this.client = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_ADMIN_API_KEY
      );
      this.index = this.client.initIndex("blogs");
      this.setupIndexSettings();
      console.log('✅ Algolia search service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Algolia:', error.message);
      this.client = null;
      this.index = null;
    }
  }

  async setupIndexSettings() {
    if (!this.index) {
      return; // Algolia not configured
    }

    try {
      await this.index.setSettings({
        searchableAttributes: [
          'title',
          'content',
          'excerpt',
          'author',
          'tags',
          'unordered(category)'
        ],
        attributesForFaceting: [
          'searchable(category)',
          'searchable(tags)',
          'searchable(author)',
          'status',
          'isFeatured'
        ],
        customRanking: [
          'desc(views)',
          'desc(likeCount)',
          'desc(commentCount)',
          'desc(createdAt)'
        ],
        attributesToHighlight: [
          'title',
          'content',
          'excerpt'
        ],
        attributesToSnippet: [
          'content:50'
        ],
        hitsPerPage: 20,
        maxValuesPerFacet: 100,
        typoTolerance: true,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8,
        allowTyposOnNumericTokens: false,
        disableTypoToleranceOnAttributes: ['author'],
        separatorsToIndex: '+#',
        removeWordsIfNoResults: 'allOptional',
        queryLanguages: ['en']
      });
    } catch (error) {
      console.error('Error setting up Algolia index:', error);
    }
  }

  stripHtml(content) {
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async indexBlog(blog) {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - skipping blog indexing');
      return;
    }

    const record = {
      objectID: blog._id.toString(),
      title: blog.title,
      content: this.stripHtml(blog.content),
      excerpt: blog.excerpt,
      author: blog.author.name,
      authorId: blog.author._id.toString(),
      authorAvatar: blog.author.avatar,
      tags: blog.tags,
      category: blog.category,
      createdAt: blog.createdAt.getTime(),
      views: blog.views,
      likeCount: blog.likes.length,
      commentCount: blog.commentCount || 0,
      readingTime: blog.readingTime,
      isFeatured: blog.isFeatured,
      status: blog.status,
      featuredImage: blog.featuredImage,
      slug: blog.slug
    };

    try {
      await this.index.saveObject(record);
      console.log(`Blog indexed: ${blog.title}`);
    } catch (error) {
      console.error('Error indexing blog:', error);
      throw error;
    }
  }

  async updateBlog(blog) {
    return this.indexBlog(blog);
  }

  async deleteBlog(blogId) {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - skipping blog deletion from index');
      return;
    }

    try {
      await this.index.deleteObject(blogId.toString());
      console.log(`Blog deleted from index: ${blogId}`);
    } catch (error) {
      console.error('Error deleting blog from index:', error);
      throw error;
    }
  }

  async bulkIndex(blogs) {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - skipping bulk indexing');
      return;
    }

    const records = blogs.map(blog => ({
      objectID: blog._id.toString(),
      title: blog.title,
      content: this.stripHtml(blog.content),
      excerpt: blog.excerpt,
      author: blog.author.name,
      authorId: blog.author._id.toString(),
      authorAvatar: blog.author.avatar,
      tags: blog.tags,
      category: blog.category,
      createdAt: blog.createdAt.getTime(),
      views: blog.views,
      likeCount: blog.likes.length,
      commentCount: blog.commentCount || 0,
      readingTime: blog.readingTime,
      isFeatured: blog.isFeatured,
      status: blog.status,
      featuredImage: blog.featuredImage,
      slug: blog.slug
    }));

    try {
      await this.index.saveObjects(records);
      console.log(`Bulk indexed ${records.length} blogs`);
    } catch (error) {
      console.error('Error bulk indexing blogs:', error);
      throw error;
    }
  }

  async search(query, filters = {}, page = 0, hitsPerPage = 20) {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - returning empty search results');
      return {
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 0,
        processingTimeMS: 0,
        facets: {},
        query: query
      };
    }

    const searchParams = {
      query,
      page,
      hitsPerPage,
      facets: ['category', 'tags', 'author', 'status'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...'
    };

    // Apply filters
    const filterStrings = [];
    
    if (filters.category && filters.category.length > 0) {
      const categoryFilters = filters.category.map(cat => `category:"${cat}"`);
      filterStrings.push(`(${categoryFilters.join(' OR ')})`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const tagFilters = filters.tags.map(tag => `tags:"${tag}"`);
      filterStrings.push(`(${tagFilters.join(' OR ')})`);
    }
    
    if (filters.author && filters.author.length > 0) {
      const authorFilters = filters.author.map(author => `author:"${author}"`);
      filterStrings.push(`(${authorFilters.join(' OR ')})`);
    }

    if (filters.status) {
      filterStrings.push(`status:"${filters.status}"`);
    }

    if (filters.isFeatured !== undefined) {
      filterStrings.push(`isFeatured:${filters.isFeatured}`);
    }

    // Date range filters
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start && end) {
        filterStrings.push(`createdAt:${start} TO ${end}`);
      }
    }

    // Numeric filters
    if (filters.minViews) {
      filterStrings.push(`views >= ${filters.minViews}`);
    }

    if (filterStrings.length > 0) {
      searchParams.filters = filterStrings.join(' AND ');
    }

    try {
      const results = await this.index.search(query, searchParams);
      return {
        hits: results.hits,
        nbHits: results.nbHits,
        page: results.page,
        nbPages: results.nbPages,
        hitsPerPage: results.hitsPerPage,
        processingTimeMS: results.processingTimeMS,
        facets: results.facets,
        query: results.query
      };
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  async getPopularSearches(limit = 10) {
    if (!this.client) {
      console.log('ℹ️  Algolia not configured - returning empty popular searches');
      return [];
    }

    try {
      // For now, return some default popular searches until Algolia analytics is properly configured
      const searches = [
        'React',
        'JavaScript', 
        'Travel',
        'Health',
        'Technology',
        'Food',
        'Lifestyle',
        'Programming'
      ].slice(0, limit);
      
      return searches;
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  async getSuggestions(query, limit = 5) {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - returning empty suggestions');
      return [];
    }

    try {
      const results = await this.index.search(query, {
        hitsPerPage: limit,
        attributesToRetrieve: ['title', 'author', 'category', 'tags'],
        attributesToHighlight: ['title']
      });
      
      return results.hits.map(hit => ({
        title: hit.title,
        author: hit.author,
        category: hit.category,
        objectID: hit.objectID,
        _highlightResult: hit._highlightResult
      }));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  async clearIndex() {
    if (!this.index) {
      console.log('ℹ️  Algolia not configured - skipping index clearing');
      return;
    }

    try {
      await this.index.clearObjects();
      console.log('Index cleared');
    } catch (error) {
      console.error('Error clearing index:', error);
      throw error;
    }
  }
}

module.exports = new SearchService();
