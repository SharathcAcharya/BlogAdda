const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return (this.likes || []).length;
});

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

// Indexes
commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Static method to get comment tree
commentSchema.statics.getCommentTree = async function(blogId) {
  const comments = await this.find({ 
    blog: blogId, 
    isDeleted: false 
  })
  .populate('author', 'name profilePic')
  .sort({ createdAt: -1 });

  // Build comment tree
  const commentMap = {};
  const rootComments = [];

  // First pass: create comment map
  comments.forEach(comment => {
    commentMap[comment._id] = {
      ...comment.toObject(),
      replies: []
    };
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    if (comment.parentComment) {
      const parent = commentMap[comment.parentComment];
      if (parent) {
        parent.replies.push(commentMap[comment._id]);
      }
    } else {
      rootComments.push(commentMap[comment._id]);
    }
  });

  return rootComments;
};

module.exports = mongoose.model('Comment', commentSchema);
