// Simple test to verify Algolia integration
const algoliasearch = require("algoliasearch");
require('dotenv').config();

function testAlgoliaConnection() {
  console.log('🔍 Testing Algolia Connection...');
  
  // Check if environment variables are set
  if (!process.env.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID === 'your-algolia-app-id') {
    console.log('❌ ALGOLIA_APP_ID not configured');
    console.log('ℹ️  Please set up your Algolia credentials in .env file');
    return false;
  }
  
  if (!process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_API_KEY === 'your-algolia-admin-api-key') {
    console.log('❌ ALGOLIA_ADMIN_API_KEY not configured');
    console.log('ℹ️  Please set up your Algolia credentials in .env file');
    return false;
  }
  
  try {
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
    );
    
    const index = client.initIndex('blogs');
    console.log('✅ Algolia client initialized successfully');
    console.log('📝 Index name: blogs');
    console.log('🔑 App ID:', process.env.ALGOLIA_APP_ID);
    console.log('🔑 Admin Key:', process.env.ALGOLIA_ADMIN_API_KEY ? '***configured***' : 'not configured');
    
    return true;
  } catch (error) {
    console.log('❌ Error initializing Algolia:', error.message);
    return false;
  }
}

async function testIndexOperation() {
  if (!testAlgoliaConnection()) {
    return;
  }
  
  try {
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
    );
    
    const index = client.initIndex('blogs');
    
    // Test a simple search (this will work even with an empty index)
    const results = await index.search('test', { hitsPerPage: 1 });
    console.log('✅ Algolia search test successful');
    console.log('📊 Results:', results.hits.length, 'hits found');
    
  } catch (error) {
    console.log('❌ Algolia search test failed:', error.message);
  }
}

// Run tests
console.log('🚀 BlogAdda Algolia Integration Test');
console.log('===================================');
testIndexOperation();
