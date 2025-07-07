const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get comments for a blog
// @route   GET /api/comments/blog/:blogId
// @access  Public
router.get('/blog/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Get paginated root comments (not replies)
    const comments = await Comment.find({ 
      blog: blogId, 
      parentComment: null,
      isDeleted: false 
    })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentComment: comment._id,
          isDeleted: false 
        })
          .populate('author', 'name profilePic')
          .sort({ createdAt: 1 })
          .limit(5); // Limit replies shown initially

        const replyCount = await Comment.countDocuments({ 
          parentComment: comment._id,
          isDeleted: false 
        });

        return {
          ...comment.toObject(),
          replies,
          totalReplies: replyCount,
          hasMoreReplies: replyCount > 5
        };
      })
    );

    const total = await Comment.countDocuments({ 
      blog: blogId, 
      parentComment: null,
      isDeleted: false 
    });

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
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
      message: 'Server error fetching comments',
      error: error.message
    });
  }
});

// @desc    Get replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const replies = await Comment.find({ 
      parentComment: commentId,
      isDeleted: false 
    })
      .populate('author', 'name profilePic')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ 
      parentComment: commentId,
      isDeleted: false 
    });

    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReplies: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching replies',
      error: error.message
    });
  }
});

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
router.post('/', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('blog').isMongoId().withMessage('Invalid blog ID'),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID')
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

    const { content, blog, parentComment } = req.body;

    // Check if blog exists
    const blogExists = await Blog.findById(blog);
    if (!blogExists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // If it's a reply, check if parent comment exists
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      content,
      blog,
      author: req.user._id,
      parentComment: parentComment || null
    });

    // Populate author info
    await comment.populate('author', 'name profilePic');

    // Create notifications
    if (parentComment) {
      // Reply notification to parent comment author
      const parentCommentData = await Comment.findById(parentComment).populate('author');
      if (parentCommentData.author._id.toString() !== req.user._id.toString()) {
        await Notification.createNotification({
          recipient: parentCommentData.author._id,
          sender: req.user._id,
          type: 'comment_reply',
          blog: blog,
          comment: comment._id
        });
      }
    } else {
      // Comment notification to blog author
      if (blogExists.author.toString() !== req.user._id.toString()) {
        await Notification.createNotification({
          recipient: blogExists.author,
          sender: req.user._id,
          type: 'blog_comment',
          blog: blog,
          comment: comment._id
        });
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog_${blog}`).emit('new_comment', {
      comment: comment.toObject(),
      isReply: !!parentComment
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating comment',
      error: error.message
    });
  }
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Author only)
router.put('/:id', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
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
    const { content } = req.body;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    await comment.populate('author', 'name profilePic');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog_${comment.blog}`).emit('comment_updated', {
      commentId: id,
      content: content,
      updatedAt: comment.updatedAt
    });

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating comment',
      error: error.message
    });
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Soft delete - mark as deleted instead of removing
    comment.isDeleted = true;
    comment.content = '[Comment deleted]';
    await comment.save();

    // Also soft delete all replies
    await Comment.updateMany(
      { parentComment: id },
      { 
        isDeleted: true,
        content: '[Comment deleted]'
      }
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog_${comment.blog}`).emit('comment_deleted', {
      commentId: id
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

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const existingLike = comment.likes.find(like => like.user.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      comment.likes.push({ user: req.user._id });

      // Create notification for comment author
      if (comment.author.toString() !== req.user._id.toString()) {
        await Notification.createNotification({
          recipient: comment.author,
          sender: req.user._id,
          type: 'comment_like',
          blog: comment.blog,
          comment: comment._id
        });
      }
    }

    await comment.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog_${comment.blog}`).emit('comment_like_updated', {
      commentId: id,
      likeCount: comment.likes.length,
      isLiked: !existingLike
    });

    res.json({
      success: true,
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      data: {
        likeCount: comment.likes.length,
        isLiked: !existingLike
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error liking comment',
      error: error.message
    });
  }
});

// @desc    Report a comment
// @route   POST /api/comments/:id/report
// @access  Private
router.post('/:id/report', protect, [
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Report reason must be between 10 and 500 characters')
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

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.isReported = true;
    comment.reportReason = reason;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment reported successfully. Our moderators will review it.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error reporting comment',
      error: error.message
    });
  }
});

module.exports = router;
