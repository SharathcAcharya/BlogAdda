const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('followers', 'name profilePic')
      .populate('following', 'name profilePic')
      .populate('blogCount')
      .select('-email -password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(follower => follower._id.toString() === req.user._id.toString());
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          isFollowing
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
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

    const { name, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(bio !== undefined && { bio })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isAlreadyFollowing = currentUser.following.includes(id);

    if (isAlreadyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        followingId => followingId.toString() !== id
      );
      userToFollow.followers = userToFollow.followers.filter(
        followerId => followerId.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(req.user._id);

      // Create notification
      await Notification.createNotification({
        recipient: id,
        sender: req.user._id,
        type: 'follow'
      });

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(`user_${id}`).emit('new_notification', {
        type: 'follow',
        message: `${req.user.name} started following you`
      });
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      message: isAlreadyFollowing ? 'User unfollowed' : 'User followed',
      data: {
        isFollowing: !isAlreadyFollowing,
        followerCount: userToFollow.followers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error following user',
      error: error.message
    });
  }
});

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(id)
      .populate({
        path: 'followers',
        select: 'name profilePic bio',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const totalFollowers = await User.findById(id).select('followers');
    const total = totalFollowers.followers.length;

    res.json({
      success: true,
      data: {
        followers: user.followers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching followers',
      error: error.message
    });
  }
});

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(id)
      .populate({
        path: 'following',
        select: 'name profilePic bio',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const totalFollowing = await User.findById(id).select('following');
    const total = totalFollowing.following.length;

    res.json({
      success: true,
      data: {
        following: user.following,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching following',
      error: error.message
    });
  }
});

// @desc    Get user's blogs
// @route   GET /api/users/:id/blogs
// @access  Public
router.get('/:id/blogs', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    
    const Blog = require('../models/Blog');
    
    const query = { author: id };
    
    // Only show published blogs to others, all blogs to the author
    if (req.user && req.user._id.toString() === id) {
      if (status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'published';
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('title slug excerpt coverImage tags category publishedAt views readingTime status');

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
      message: 'Server error fetching user blogs',
      error: error.message
    });
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { bio: searchRegex }
      ],
      isActive: true,
      isBanned: false
    })
      .select('name profilePic bio followerCount')
      .sort({ followerCount: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      $or: [
        { name: searchRegex },
        { bio: searchRegex }
      ],
      isActive: true,
      isBanned: false
    });

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
      message: 'Server error searching users',
      error: error.message
    });
  }
});

module.exports = router;
