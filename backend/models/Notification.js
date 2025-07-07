const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'follow',           // User followed you
      'blog_like',        // Someone liked your blog
      'blog_comment',     // Someone commented on your blog
      'comment_like',     // Someone liked your comment
      'comment_reply',    // Someone replied to your comment
      'blog_bookmark',    // Someone bookmarked your blog
      'mention',          // Someone mentioned you
      'admin_notice'      // Admin notification
    ]
  },
  
  // Reference objects
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Metadata
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const { recipient, sender, type, blog, comment, additionalData } = data;
  
  // Don't send notification to self
  if (recipient.toString() === sender.toString()) {
    return null;
  }
  
  // Generate title and message based on type
  const User = mongoose.model('User');
  const senderUser = await User.findById(sender).select('name');
  
  let title, message;
  
  switch (type) {
    case 'follow':
      title = 'New Follower';
      message = `${senderUser.name} started following you`;
      break;
      
    case 'blog_like':
      title = 'Blog Liked';
      message = `${senderUser.name} liked your blog post`;
      break;
      
    case 'blog_comment':
      title = 'New Comment';
      message = `${senderUser.name} commented on your blog post`;
      break;
      
    case 'comment_like':
      title = 'Comment Liked';
      message = `${senderUser.name} liked your comment`;
      break;
      
    case 'comment_reply':
      title = 'Comment Reply';
      message = `${senderUser.name} replied to your comment`;
      break;
      
    case 'blog_bookmark':
      title = 'Blog Bookmarked';
      message = `${senderUser.name} bookmarked your blog post`;
      break;
      
    case 'mention':
      title = 'You were mentioned';
      message = `${senderUser.name} mentioned you in a post`;
      break;
      
    case 'admin_notice':
      title = additionalData?.title || 'Admin Notice';
      message = additionalData?.message || 'You have a new admin notification';
      break;
      
    default:
      title = 'New Notification';
      message = 'You have a new notification';
  }
  
  // Create notification
  const notification = new this({
    recipient,
    sender,
    type,
    blog,
    comment,
    title,
    message,
    data: additionalData || {}
  });
  
  await notification.save();
  
  // Populate sender for real-time emission
  await notification.populate('sender', 'name profilePic');
  
  return notification;
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  const result = await this.updateMany(
    {
      recipient: userId,
      _id: { $in: notificationIds },
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
  
  return result;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
