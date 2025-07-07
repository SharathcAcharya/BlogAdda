// BlogAdda System Check Script
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SystemCheck {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  addCheck(name, status, message) {
    this.checks.push({ name, status, message });
    if (status === 'error') {
      this.errors.push(message);
    } else if (status === 'warning') {
      this.warnings.push(message);
    }
  }

  checkEnvironmentVariables() {
    this.log('Checking environment variables...', 'info');
    
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'ALGOLIA_APP_ID',
      'ALGOLIA_ADMIN_API_KEY',
      'ALGOLIA_SEARCH_API_KEY'
    ];

    const optionalVars = [
      'CLOUDINARY_CLOUD_NAME',
      'EMAIL_HOST',
      'EMAIL_USER',
      'CLIENT_URL'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.includes('your-')) {
        this.addCheck(varName, 'error', `${varName} is not configured`);
        this.log(`${varName} is not configured`, 'error');
      } else {
        this.addCheck(varName, 'success', `${varName} is configured`);
        this.log(`${varName} is configured`, 'success');
      }
    });

    optionalVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.includes('your-')) {
        this.addCheck(varName, 'warning', `${varName} is not configured (optional)`);
        this.log(`${varName} is not configured (optional)`, 'warning');
      } else {
        this.addCheck(varName, 'success', `${varName} is configured`);
        this.log(`${varName} is configured`, 'success');
      }
    });
  }

  checkFileStructure() {
    this.log('Checking file structure...', 'info');
    
    const requiredFiles = [
      '../package.json',
      '../frontend/package.json',
      '../admin/package.json',
      './models/Blog.js',
      './models/User.js',
      './services/SearchService.js',
      './services/AnalyticsService.js',
      './routes/search.js',
      './routes/analytics.js',
      '../frontend/src/components/search/AdvancedSearch.jsx',
      '../frontend/src/components/analytics/AnalyticsDashboard.jsx',
      '../frontend/src/components/pwa/PWAInstallPrompt.jsx'
    ];

    requiredFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        this.addCheck(`File: ${filePath}`, 'success', `${filePath} exists`);
      } else {
        this.addCheck(`File: ${filePath}`, 'error', `${filePath} is missing`);
        this.log(`${filePath} is missing`, 'error');
      }
    });
  }

  checkDependencies() {
    this.log('Checking dependencies...', 'info');
    
    try {
      const packageJson = require('../package.json');
      this.log(`Root package.json version: ${packageJson.version}`, 'success');
      
      const backendPackageJson = require('./package.json');
      this.log(`Backend package.json version: ${backendPackageJson.version}`, 'success');
      
      // Check if key dependencies are installed
      const keyDependencies = ['algoliasearch', 'mongoose', 'express'];
      keyDependencies.forEach(dep => {
        if (backendPackageJson.dependencies[dep]) {
          this.log(`${dep} dependency found: ${backendPackageJson.dependencies[dep]}`, 'success');
        } else {
          this.log(`${dep} dependency missing`, 'error');
        }
      });
      
    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error');
    }
  }

  async checkAlgoliaConnection() {
    this.log('Checking Algolia connection...', 'info');
    
    if (!process.env.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID.includes('your-')) {
      this.addCheck('Algolia', 'warning', 'Algolia credentials not configured');
      this.log('Algolia credentials not configured - this is expected for initial setup', 'warning');
      return;
    }

    try {
      const algoliasearch = require('algoliasearch');
      const client = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_ADMIN_API_KEY
      );
      
      const index = client.initIndex('blogs');
      await index.search('test', { hitsPerPage: 1 });
      
      this.addCheck('Algolia', 'success', 'Algolia connection successful');
      this.log('Algolia connection successful', 'success');
    } catch (error) {
      this.addCheck('Algolia', 'error', `Algolia connection failed: ${error.message}`);
      this.log(`Algolia connection failed: ${error.message}`, 'error');
    }
  }

  async checkDatabase() {
    this.log('Checking database connection...', 'info');
    
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your-')) {
      this.addCheck('Database', 'warning', 'Database URI not configured');
      this.log('Database URI not configured - this is expected for initial setup', 'warning');
      return;
    }

    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      
      this.addCheck('Database', 'success', 'Database connection successful');
      this.log('Database connection successful', 'success');
      
      await mongoose.disconnect();
    } catch (error) {
      this.addCheck('Database', 'error', `Database connection failed: ${error.message}`);
      this.log(`Database connection failed: ${error.message}`, 'error');
    }
  }

  printSummary() {
    console.log('\n🎯 SYSTEM CHECK SUMMARY');
    console.log('======================');
    
    const successCount = this.checks.filter(c => c.status === 'success').length;
    const warningCount = this.checks.filter(c => c.status === 'warning').length;
    const errorCount = this.checks.filter(c => c.status === 'error').length;
    
    console.log(`✅ Successful checks: ${successCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ISSUES TO FIX:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (recommended to fix):');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n🚀 NEXT STEPS:');
    
    if (this.errors.length > 0) {
      console.log('1. Fix the critical issues listed above');
      console.log('2. Set up environment variables in .env file');
      console.log('3. Run this check again');
    } else if (this.warnings.length > 0) {
      console.log('1. Address warnings if needed');
      console.log('2. Run deployment script: ./deploy.bat');
      console.log('3. Test all features');
    } else {
      console.log('1. All checks passed! 🎉');
      console.log('2. Run deployment script: ./deploy.bat');
      console.log('3. Deploy to production');
    }
    
    console.log('\n📚 For detailed setup instructions, see:');
    console.log('   - DEPLOYMENT_GUIDE.md');
    console.log('   - DEPLOYMENT_CHECKLIST.md');
  }

  async runAllChecks() {
    console.log('🔍 BlogAdda System Check');
    console.log('========================\n');
    
    this.checkEnvironmentVariables();
    console.log('');
    
    this.checkFileStructure();
    console.log('');
    
    this.checkDependencies();
    console.log('');
    
    await this.checkAlgoliaConnection();
    console.log('');
    
    await this.checkDatabase();
    console.log('');
    
    this.printSummary();
  }
}

// Run the system check
const systemCheck = new SystemCheck();
systemCheck.runAllChecks().catch(error => {
  console.error('❌ System check failed:', error);
  process.exit(1);
});
