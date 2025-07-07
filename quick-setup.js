#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BlogAdda Quick Setup Script');
console.log('================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Run this script from the BlogAdda root directory');
  process.exit(1);
}

// Function to run command safely
function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check if command exists
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check prerequisites
console.log('🔍 Checking prerequisites...');
if (!commandExists('node')) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

if (!commandExists('npm')) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

console.log('✅ Prerequisites check passed\n');

// Install dependencies
console.log('📦 Installing dependencies...');
runCommand('npm run install-all', 'Installing all dependencies');

// Create seed data
console.log('🌱 Setting up database...');
runCommand('npm run seed', 'Creating seed data');

// Build applications
console.log('🏗️ Building applications...');
runCommand('npm run build', 'Building frontend and admin');

// Run system check
console.log('🔍 Running system health check...');
runCommand('npm run health-check', 'System health check');

console.log('🎉 Setup Complete!');
console.log('==================\n');

console.log('📋 Next Steps:');
console.log('1. Update environment variables in .env files');
console.log('2. Set up Algolia account and update search credentials');
console.log('3. Start development: npm run dev');
console.log('4. Visit http://localhost:3000 (Frontend)');
console.log('5. Visit http://localhost:3001 (Admin Panel)');
console.log('6. Visit http://localhost:5000 (Backend API)\n');

console.log('📚 Documentation:');
console.log('- Setup Guide: README.md');
console.log('- Deployment Guide: DEPLOYMENT_GUIDE.md');
console.log('- Implementation Summary: IMPLEMENTATION_SUMMARY.md');
console.log('- Final Status: FINAL_STATUS.md\n');

console.log('🔗 Quick Links:');
console.log('- Frontend: http://localhost:3000');
console.log('- Admin Panel: http://localhost:3001');
console.log('- Backend API: http://localhost:5000');
console.log('- API Documentation: http://localhost:5000/api/docs');
