const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/AnalyticsService');
const { protect } = require('../middleware/auth');
const { query, param, validationResult } = require('express-validator');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', [
  protect,
  query('timeRange').optional().isIn(['24h', '7d', '30d', '90d'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { timeRange = '7d' } = req.query;
    const analyticsService = new AnalyticsService();
    
    const stats = await analyticsService.getDashboardStats(timeRange, req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/blog/:blogId
// @desc    Get blog-specific analytics
// @access  Private
router.get('/blog/:blogId', [
  protect,
  param('blogId').isMongoId(),
  query('timeRange').optional().isIn(['7d', '30d', '90d'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { blogId } = req.params;
    const { timeRange = '30d' } = req.query;
    
    // Check if user owns the blog or is admin
    const Blog = require('../models/Blog');
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const analyticsService = new AnalyticsService();
    const stats = await analyticsService.getBlogAnalytics(blogId, timeRange);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Blog analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/user
// @desc    Get user analytics
// @access  Private
router.get('/user', [
  protect,
  query('timeRange').optional().isIn(['7d', '30d', '90d'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { timeRange = '30d' } = req.query;
    const analyticsService = new AnalyticsService();
    
    const stats = await analyticsService.getUserAnalytics(req.user.id, timeRange);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/analytics/track
// @desc    Track a custom event
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { type, blogId, metadata } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required'
      });
    }

    // Use the tracking function added by middleware
    await req.track(type, { ...metadata, blogId });
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/admin/overview
// @desc    Get admin analytics overview
// @access  Private/Admin
router.get('/admin/overview', [
  protect,
  query('timeRange').optional().isIn(['24h', '7d', '30d', '90d'])
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { timeRange = '7d' } = req.query;
    const analyticsService = new AnalyticsService();
    
    // Get platform-wide analytics (no userId filter)
    const stats = await analyticsService.getDashboardStats(timeRange);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
