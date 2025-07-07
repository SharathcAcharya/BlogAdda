const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { protect, admin, moderator } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Get overall stats
    const [
      totalUsers,
      totalBlogs,
      totalComments,
      publishedBlogs,
      draftBlogs,
      thisMonthUsers,
      thisWeekUsers,
      thisMonthBlogs,
      thisWeekBlogs,
      reportedBlogs,
      reportedComments,
      bannedUsers
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Blog.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Blog.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Blog.countDocuments({ isReported: true }),
      Comment.countDocuments({ isReported: true }),
      User.countDocuments({ isBanned: true })
    ]);

    // Get trending blogs
    const trendingBlogs = await Blog.getTrending(5);

    // Get top authors by follower count
    const topAuthors = await User.find()
      .sort({ 'followers.length': -1 })
      .limit(5)
      .select('name profilePic followerCount blogCount');

    // Get recent activities
    const recentBlogs = await Blog.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug author publishedAt views likeCount');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name profilePic createdAt');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBlogs,
          totalComments,
          publishedBlogs,
          draftBlogs,
          reportedBlogs,
          reportedComments,
          bannedUsers
        },
        growth: {
          thisMonthUsers,
          thisWeekUsers,
          thisMonthBlogs,
          thisWeekBlogs
        },
        trending: {
          blogs: trendingBlogs,
          authors: topAuthors
        },
        recent: {
          blogs: recentBlogs,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin stats',
      error: error.message
    });
  }
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', protect, admin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['active', 'banned', 'all']).withMessage('Invalid status filter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status = 'all'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    if (status === 'active') {
      query.isBanned = false;
      query.isActive = true;
    } else if (status === 'banned') {
      query.isBanned = true;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name email profilePic role isActive isBanned banReason createdAt lastLogin followerCount blogCount');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
});

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin only)
router.put('/users/:id/ban', protect, admin, [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cannot ban admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : undefined;
    await user.save();

    // Send notification to user
    if (user.isBanned) {
      await Notification.createNotification({
        recipient: user._id,
        sender: req.user._id,
        type: 'admin_notice',
        additionalData: {
          title: 'Account Banned',
          message: `Your account has been banned. Reason: ${reason || 'Terms of service violation'}`
        }
      });
    }

    res.json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
          banReason: user.banReason
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error banning user',
      error: error.message
    });
  }
});

// @desc    Get all blogs (admin)
// @route   GET /api/admin/blogs
// @access  Private (Admin/Moderator)
router.get('/blogs', protect, moderator, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['published', 'draft', 'archived', 'reported', 'all']).withMessage('Invalid status filter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status = 'all'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    if (status !== 'all') {
      if (status === 'reported') {
        query.isReported = true;
      } else {
        query.status = status;
      }
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching blogs',
      error: error.message
    });
  }
});

// @desc    Delete blog (admin)
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
router.delete('/blogs/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete blog and associated comments
    await Promise.all([
      Blog.findByIdAndDelete(id),
      Comment.deleteMany({ blog: id })
    ]);

    // Send notification to author
    await Notification.createNotification({
      recipient: blog.author._id,
      sender: req.user._id,
      type: 'admin_notice',
      additionalData: {
        title: 'Blog Removed',
        message: `Your blog "${blog.title}" has been removed by an administrator.`
      }
    });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting blog',
      error: error.message
    });
  }
});

// @desc    Feature/Unfeature blog
// @route   PUT /api/admin/blogs/:id/feature
// @access  Private (Admin only)
router.put('/blogs/:id/feature', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.json({
      success: true,
      message: blog.isFeatured ? 'Blog featured successfully' : 'Blog unfeatured successfully',
      data: {
        blog: {
          id: blog._id,
          title: blog.title,
          isFeatured: blog.isFeatured
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error featuring blog',
      error: error.message
    });
  }
});

// @desc    Get reported comments
// @route   GET /api/admin/comments/reported
// @access  Private (Admin/Moderator)
router.get('/comments/reported', protect, moderator, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ isReported: true, isDeleted: false })
      .populate('author', 'name email profilePic')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ isReported: true, isDeleted: false });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching reported comments',
      error: error.message
    });
  }
});

// @desc    Delete comment (admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin/Moderator)
router.delete('/comments/:id', protect, moderator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id).populate('author', 'name email');
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.content = '[Comment removed by moderator]';
    await comment.save();

    // Send notification to author
    await Notification.createNotification({
      recipient: comment.author._id,
      sender: req.user._id,
      type: 'admin_notice',
      additionalData: {
        title: 'Comment Removed',
        message: 'One of your comments has been removed by a moderator for violating community guidelines.'
      }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment',
      error: error.message
    });
  }
});

module.exports = router;
