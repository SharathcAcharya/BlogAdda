const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Blog = require('./models/Blog');

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check blogs
    const blogs = await Blog.find({}).limit(1);
    console.log('📄 Sample blog:', JSON.stringify(blogs[0], null, 2));
    
    // Check with populated data
    const blogWithAuthor = await Blog.findOne({}).populate('author', 'name profilePic bio');
    console.log('👤 Blog with author:', JSON.stringify(blogWithAuthor, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDatabase();
