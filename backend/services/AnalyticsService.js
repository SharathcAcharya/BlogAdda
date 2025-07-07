const Analytics = require('../models/Analytics');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');

class AnalyticsService {
  // Track an event
  async trackEvent(eventData) {
    try {
      const event = new Analytics(eventData);
      await event.save();
      return event;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats(timeRange = '7d', userId = null) {
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on time range
    switch (timeRange) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const matchFilter = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    // If userId is provided, filter by user's content
    if (userId) {
      const userBlogs = await Blog.find({ author: userId }).select('_id');
      const blogIds = userBlogs.map(blog => blog._id);
      matchFilter.$or = [
        { userId: userId },
        { blogId: { $in: blogIds } }
      ];
    }

    try {
      const [
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        pageViews,
        blogViews,
        deviceStats,
        topBlogs,
        recentActivity,
        hourlyStats
      ] = await Promise.all([
        // Total views
        Analytics.countDocuments({
          ...matchFilter,
          type: { $in: ['page_view', 'blog_view'] }
        }),

        // Total likes
        Analytics.countDocuments({
          ...matchFilter,
          type: 'blog_like'
        }),

        // Total comments
        Analytics.countDocuments({
          ...matchFilter,
          type: 'comment'
        }),

        // Total shares
        Analytics.countDocuments({
          ...matchFilter,
          type: 'blog_share'
        }),

        // Page views breakdown
        Analytics.aggregate([
          { $match: { ...matchFilter, type: 'page_view' } },
          { $group: { _id: '$metadata.page', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Blog views
        Analytics.aggregate([
          { $match: { ...matchFilter, type: 'blog_view' } },
          { $group: { _id: '$blogId', views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'blogs',
              localField: '_id',
              foreignField: '_id',
              as: 'blog'
            }
          },
          { $unwind: '$blog' },
          {
            $project: {
              title: '$blog.title',
              slug: '$blog.slug',
              views: 1
            }
          }
        ]),

        // Device statistics
        Analytics.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$device.type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Top performing blogs
        Blog.aggregate([
          ...(userId ? [{ $match: { author: mongoose.Types.ObjectId(userId) } }] : []),
          {
            $lookup: {
              from: 'analytics',
              let: { blogId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$blogId', '$$blogId'] },
                    type: 'blog_view',
                    timestamp: { $gte: startDate, $lte: endDate }
                  }
                }
              ],
              as: 'analytics'
            }
          },
          {
            $addFields: {
              periodViews: { $size: '$analytics' }
            }
          },
          { $sort: { periodViews: -1 } },
          { $limit: 5 },
          {
            $project: {
              title: 1,
              slug: 1,
              views: 1,
              likeCount: { $size: { $ifNull: ['$likes', []] } },
              periodViews: 1,
              createdAt: 1
            }
          }
        ]),

        // Recent activity
        Analytics.aggregate([
          { $match: matchFilter },
          { $sort: { timestamp: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'blogs',
              localField: 'blogId',
              foreignField: '_id',
              as: 'blog'
            }
          },
          {
            $project: {
              type: 1,
              timestamp: 1,
              metadata: 1,
              user: { $arrayElemAt: ['$user', 0] },
              blog: { $arrayElemAt: ['$blog', 0] }
            }
          }
        ]),

        // Hourly statistics for charts
        Analytics.aggregate([
          { $match: matchFilter },
          {
            $group: {
              _id: {
                hour: { $hour: '$timestamp' },
                date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1, '_id.hour': 1 } }
        ])
      ]);

      return {
        summary: {
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          timeRange
        },
        pageViews,
        blogViews,
        deviceStats,
        topBlogs,
        recentActivity,
        hourlyStats
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  // Get detailed blog analytics
  async getBlogAnalytics(blogId, timeRange = '30d') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    try {
      const [
        viewsOverTime,
        referrerStats,
        deviceStats,
        locationStats,
        engagementStats
      ] = await Promise.all([
        // Views over time
        Analytics.aggregate([
          {
            $match: {
              blogId: mongoose.Types.ObjectId(blogId),
              type: 'blog_view',
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              views: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        // Referrer statistics
        Analytics.aggregate([
          {
            $match: {
              blogId: mongoose.Types.ObjectId(blogId),
              type: 'blog_view',
              timestamp: { $gte: startDate, $lte: endDate },
              referrer: { $exists: true, $ne: '' }
            }
          },
          { $group: { _id: '$referrer', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Device statistics
        Analytics.aggregate([
          {
            $match: {
              blogId: mongoose.Types.ObjectId(blogId),
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          { $group: { _id: '$device.type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Location statistics
        Analytics.aggregate([
          {
            $match: {
              blogId: mongoose.Types.ObjectId(blogId),
              timestamp: { $gte: startDate, $lte: endDate },
              'location.country': { $exists: true }
            }
          },
          { $group: { _id: '$location.country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Engagement statistics
        Analytics.aggregate([
          {
            $match: {
              blogId: mongoose.Types.ObjectId(blogId),
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      return {
        viewsOverTime,
        referrerStats,
        deviceStats,
        locationStats,
        engagementStats,
        timeRange
      };
    } catch (error) {
      console.error('Blog analytics error:', error);
      throw error;
    }
  }

  // Get user analytics
  async getUserAnalytics(userId, timeRange = '30d') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    try {
      const userBlogs = await Blog.find({ author: userId }).select('_id');
      const blogIds = userBlogs.map(blog => blog._id);

      const [
        totalViews,
        totalLikes,
        totalComments,
        blogPerformance,
        audienceStats,
        contentStats
      ] = await Promise.all([
        // Total views across all user's blogs
        Analytics.countDocuments({
          blogId: { $in: blogIds },
          type: 'blog_view',
          timestamp: { $gte: startDate, $lte: endDate }
        }),

        // Total likes
        Analytics.countDocuments({
          blogId: { $in: blogIds },
          type: 'blog_like',
          timestamp: { $gte: startDate, $lte: endDate }
        }),

        // Total comments
        Analytics.countDocuments({
          blogId: { $in: blogIds },
          type: 'comment',
          timestamp: { $gte: startDate, $lte: endDate }
        }),

        // Individual blog performance
        Analytics.aggregate([
          {
            $match: {
              blogId: { $in: blogIds },
              type: 'blog_view',
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          { $group: { _id: '$blogId', views: { $sum: 1 } } },
          {
            $lookup: {
              from: 'blogs',
              localField: '_id',
              foreignField: '_id',
              as: 'blog'
            }
          },
          { $unwind: '$blog' },
          {
            $project: {
              title: '$blog.title',
              slug: '$blog.slug',
              views: 1,
              createdAt: '$blog.createdAt'
            }
          },
          { $sort: { views: -1 } }
        ]),

        // Audience statistics
        Analytics.aggregate([
          {
            $match: {
              blogId: { $in: blogIds },
              timestamp: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                type: '$device.type',
                country: '$location.country'
              },
              count: { $sum: 1 }
            }
          }
        ]),

        // Content statistics
        Blog.aggregate([
          { $match: { author: mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalViews: { $sum: '$views' },
              totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
            }
          },
          { $sort: { totalViews: -1 } }
        ])
      ]);

      return {
        summary: {
          totalViews,
          totalLikes,
          totalComments,
          totalBlogs: userBlogs.length
        },
        blogPerformance,
        audienceStats,
        contentStats,
        timeRange
      };
    } catch (error) {
      console.error('User analytics error:', error);
      throw error;
    }
  }

  // Track middleware for automatic event tracking
  static trackingMiddleware() {
    return (req, res, next) => {
      // Extract device and location info
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress;
      const referrer = req.get('Referer') || '';

      // Simple device detection
      let deviceType = 'desktop';
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
      }

      // Add tracking function to request
      req.track = async (type, data = {}) => {
        try {
          const analyticsService = new AnalyticsService();
          await analyticsService.trackEvent({
            type,
            userId: req.user?.id || null,
            metadata: data,
            userAgent,
            ipAddress,
            referrer,
            device: {
              type: deviceType,
              browser: this.extractBrowser(userAgent),
              os: this.extractOS(userAgent)
            },
            sessionId: req.sessionID
          });
        } catch (error) {
          console.error('Tracking error:', error);
        }
      };

      next();
    };
  }

  static extractBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  static extractOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}

module.exports = AnalyticsService;
