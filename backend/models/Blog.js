const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  coverImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'technology', 'lifestyle', 'travel', 'food', 'health', 
      'business', 'education', 'entertainment', 'sports', 
      'politics', 'science', 'other'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Engagement metrics
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
  bookmarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  
  // SEO and sharing
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  readingTime: {
    type: Number, // in minutes
    default: 1
  },
  
  // Publishing details
  publishedAt: Date,
  updatedAt: Date,
  
  // Moderation
  isFeatured: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return (this.likes || []).length;
});

// Virtual for bookmark count
blogSchema.virtual('bookmarkCount').get(function() {
  return (this.bookmarks || []).length;
});

// Virtual for comment count
blogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Indexes for efficient queries (slug index is handled by unique: true)
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ title: 'text', content: 'text' });

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    this.excerpt = plainText.substring(0, 297) + '...';
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to get trending blogs
blogSchema.statics.getTrending = function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: oneWeekAgo }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 3] },
            { $multiply: ['$views', 0.1] },
            { $multiply: [{ $size: '$bookmarks' }, 5] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' }
  ]);
};

module.exports = mongoose.model('Blog', blogSchema);

// Import after module export to avoid circular dependency
const SearchService = require('../services/SearchService');

// Post-save hook to index blog in Algolia
blogSchema.post('save', async function(doc) {
  if (doc.status === 'published') {
    try {
      const populatedDoc = await this.model('Blog').findById(doc._id).populate('author', 'name avatar');
      await SearchService.indexBlog(populatedDoc);
    } catch (error) {
      console.error('Error indexing blog in search:', error);
    }
  }
});

// Post-update hook to update blog in Algolia
blogSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'published') {
    try {
      const populatedDoc = await this.model('Blog').findById(doc._id).populate('author', 'name avatar');
      await SearchService.updateBlog(populatedDoc);
    } catch (error) {
      console.error('Error updating blog in search:', error);
    }
  }
});

// Post-remove hook to remove blog from Algolia
blogSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      await SearchService.deleteBlog(doc._id);
    } catch (error) {
      console.error('Error removing blog from search:', error);
    }
  }
});
