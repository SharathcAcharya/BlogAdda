const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@blogadda.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Admin login failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function checkAdminUser() {
  try {
    console.log('👤 Checking admin user in database...');
    
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogadda');
    
    const adminUser = await User.findOne({ email: 'admin@blogadda.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('- Name:', adminUser.name);
      console.log('- Email:', adminUser.email);
      console.log('- Role:', adminUser.role);
      console.log('- Is Banned:', adminUser.isBanned);
    } else {
      console.log('❌ Admin user not found');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
}

async function main() {
  await checkAdminUser();
  await testAdminLogin();
}

main();
