const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('tags').optional().trim(),
  query('author').optional().isMongoId().withMessage('Invalid author ID')
], optionalAuth, async (req, res) => {
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
      limit = 10,
      search,
      category,
      tags,
      author,
      sort = 'publishedAt'
    } = req.query;

    // Build query
    const query = { status: 'published' };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (author) {
      query.author = author;
    }

    // Build sort object
    const sortOptions = {};
    switch (sort) {
      case 'latest':
        sortOptions.publishedAt = -1;
        break;
      case 'oldest':
        sortOptions.publishedAt = 1;
        break;
      case 'views':
        sortOptions.views = -1;
        break;
      case 'likes':
        sortOptions.likeCount = -1;
        break;
      default:
        sortOptions.publishedAt = -1;
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePic bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title slug excerpt coverImage tags category publishedAt views readingTime likes bookmarks');

    const total = await Blog.countDocuments(query);

    // Add user interaction data if authenticated
    if (req.user) {
      for (let blog of blogs) {
        blog.isLiked = (blog.likes || []).some(like => like.user.toString() === req.user._id.toString());
        blog.isBookmarked = (blog.bookmarks || []).some(bookmark => bookmark.user.toString() === req.user._id.toString());
      }
    }

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

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingBlogs = await Blog.getTrending(parseInt(limit));

    // Add user interaction data if authenticated
    if (req.user) {
      for (let blog of trendingBlogs) {
        blog.isLiked = (blog.likes || []).some(like => like.user.toString() === req.user._id.toString());
        blog.isBookmarked = (blog.bookmarks || []).some(bookmark => bookmark.user.toString() === req.user._id.toString());
      }
    }

    res.json({
      success: true,
      data: {
        blogs: trendingBlogs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending blogs',
      error: error.message
    });
  }
});

// @desc    Get single blog
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name profilePic bio followerCount')
      .populate('commentCount');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    // Add user interaction data if authenticated
    if (req.user) {
      blog.isLiked = (blog.likes || []).some(like => like.user.toString() === req.user._id.toString());
      blog.isBookmarked = (blog.bookmarks || []).some(bookmark => bookmark.user.toString() === req.user._id.toString());
      blog.isFollowing = blog.author.followers.includes(req.user._id);
    }

    res.json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching blog',
      error: error.message
    });
  }
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('category').isIn(['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'education', 'entertainment', 'sports', 'politics', 'science', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status')
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

    const blogData = {
      ...req.body,
      author: req.user._id
    };

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name profilePic');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating blog',
      error: error.message
    });
  }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Author only)
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').optional().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('category').optional().isIn(['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'education', 'entertainment', 'sports', 'politics', 'science', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
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
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'name profilePic');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: {
        blog: updatedBlog
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating blog',
      error: error.message
    });
  }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await Blog.findByIdAndDelete(id);
    
    // Delete associated comments
    await Comment.deleteMany({ blog: id });

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

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const existingLike = blog.likes.find(like => like.user.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      blog.likes.push({ user: req.user._id });

      // Create notification for blog author
      if (blog.author.toString() !== req.user._id.toString()) {
        await Notification.createNotification({
          recipient: blog.author,
          sender: req.user._id,
          type: 'blog_like',
          blog: blog._id
        });
      }
    }

    await blog.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog_${id}`).emit('blog_like_updated', {
      blogId: id,
      likeCount: blog.likes.length,
      isLiked: !existingLike
    });

    res.json({
      success: true,
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      data: {
        likeCount: blog.likes.length,
        isLiked: !existingLike
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error liking blog',
      error: error.message
    });
  }
});

// @desc    Bookmark/Unbookmark blog
// @route   POST /api/blogs/:id/bookmark
// @access  Private
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const existingBookmark = blog.bookmarks.find(bookmark => bookmark.user.toString() === req.user._id.toString());

    if (existingBookmark) {
      // Remove bookmark
      blog.bookmarks = blog.bookmarks.filter(bookmark => bookmark.user.toString() !== req.user._id.toString());
    } else {
      // Add bookmark
      blog.bookmarks.push({ user: req.user._id });

      // Create notification for blog author
      if (blog.author.toString() !== req.user._id.toString()) {
        await Notification.createNotification({
          recipient: blog.author,
          sender: req.user._id,
          type: 'blog_bookmark',
          blog: blog._id
        });
      }
    }

    await blog.save();

    res.json({
      success: true,
      message: existingBookmark ? 'Bookmark removed' : 'Blog bookmarked',
      data: {
        bookmarkCount: blog.bookmarks.length,
        isBookmarked: !existingBookmark
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error bookmarking blog',
      error: error.message
    });
  }
});

// @desc    Get user's bookmarked blogs
// @route   GET /api/blogs/user/bookmarks
// @access  Private
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({
      'bookmarks.user': req.user._id,
      status: 'published'
    })
      .populate('author', 'name profilePic')
      .sort({ 'bookmarks.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title slug excerpt coverImage tags category publishedAt views readingTime');

    const total = await Blog.countDocuments({
      'bookmarks.user': req.user._id,
      status: 'published'
    });

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
      message: 'Server error fetching bookmarked blogs',
      error: error.message
    });
  }
});

module.exports = router;
