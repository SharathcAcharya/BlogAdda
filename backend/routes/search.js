const express = require('express');
const router = express.Router();
const SearchService = require('../services/SearchService');
const { body, query, validationResult } = require('express-validator');

// @route   GET /api/search
// @desc    Search blogs with filters
// @access  Public
router.get('/', [
  query('q').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('category').optional().isArray(),
  query('tags').optional().isArray(),
  query('author').optional().isArray(),
  query('status').optional().isIn(['published', 'draft']),
  query('isFeatured').optional().isBoolean(),
  query('page').optional().isInt({ min: 0 }),
  query('hitsPerPage').optional().isInt({ min: 1, max: 50 }),
  query('minViews').optional().isInt({ min: 0 }),
  query('dateStart').optional().isISO8601(),
  query('dateEnd').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      q = '',
      category,
      tags,
      author,
      status,
      isFeatured,
      page = 0,
      hitsPerPage = 20,
      minViews,
      dateStart,
      dateEnd
    } = req.query;

    const filters = {};
    
    if (category) filters.category = Array.isArray(category) ? category : [category];
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (author) filters.author = Array.isArray(author) ? author : [author];
    if (status) filters.status = status;
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    if (minViews) filters.minViews = parseInt(minViews);
    
    if (dateStart && dateEnd) {
      filters.dateRange = {
        start: new Date(dateStart).getTime(),
        end: new Date(dateEnd).getTime()
      };
    }

    const results = await SearchService.search(
      q,
      filters,
      parseInt(page),
      parseInt(hitsPerPage)
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', [
  query('q').notEmpty().isString().trim().isLength({ min: 1, max: 50 }),
  query('limit').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { q, limit = 5 } = req.query;
    
    const suggestions = await SearchService.getSuggestions(q, parseInt(limit));
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/search/popular
// @desc    Get popular searches
// @access  Public
router.get('/popular', [
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularSearches = await SearchService.getPopularSearches(parseInt(limit));
    
    res.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/search/reindex
// @desc    Reindex all blogs (Admin only)
// @access  Private/Admin
router.post('/reindex', async (req, res) => {
  try {
    // Add admin authentication middleware here
    const Blog = require('../models/Blog');
    
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name avatar')
      .lean();
    
    await SearchService.clearIndex();
    await SearchService.bulkIndex(blogs);
    
    res.json({
      success: true,
      message: `Successfully reindexed ${blogs.length} blogs`
    });
  } catch (error) {
    console.error('Reindex error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
