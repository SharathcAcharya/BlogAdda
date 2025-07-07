require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const SearchService = require('../services/SearchService');

async function bulkIndexBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all published blogs with populated author
    console.log('📚 Fetching blogs from database...');
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name avatar')
      .lean();

    console.log(`📊 Found ${blogs.length} published blogs`);

    if (blogs.length === 0) {
      console.log('❌ No blogs found to index');
      return;
    }

    // Clear existing index
    console.log('🗑️ Clearing existing search index...');
    await SearchService.clearIndex();

    // Bulk index all blogs
    console.log('🔍 Indexing blogs in Algolia...');
    await SearchService.bulkIndex(blogs);

    console.log('✅ Successfully indexed all blogs!');
    console.log(`📈 Total blogs indexed: ${blogs.length}`);

  } catch (error) {
    console.error('❌ Error during bulk indexing:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📪 MongoDB connection closed');
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the bulk indexing
if (require.main === module) {
  bulkIndexBlogs();
}

module.exports = bulkIndexBlogs;
