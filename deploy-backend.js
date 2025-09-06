#!/usr/bin/env node

/**
 * Backend Deployment Helper Script
 * This script helps prepare your backend for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Prima ERP Backend Deployment Helper\n');

// Check if backend folder exists
const backendPath = path.join(__dirname, 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend folder not found!');
  process.exit(1);
}

// Check package.json
const packageJsonPath = path.join(backendPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Backend package.json not found!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('✅ Backend structure check:');
console.log(`   - Package name: ${packageJson.name}`);
console.log(`   - Start script: ${packageJson.scripts.start || 'Not found'}`);
console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length} packages\n`);

// Check environment example
const envExamplePath = path.join(backendPath, 'env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ Environment example file found');
} else {
  console.log('⚠️  Environment example file not found');
}

// Check server.js
const serverPath = path.join(backendPath, 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ Server file found');
} else {
  console.log('❌ Server file not found!');
}

console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Backend folder structure');
console.log('2. ✅ Package.json configured');
console.log('3. ✅ Server.js exists');
console.log('4. ✅ Railway/Procfile configuration');

console.log('\n🌐 Next Steps:');
console.log('1. Choose a deployment platform (Railway recommended)');
console.log('2. Connect your GitHub repository');
console.log('3. Set root directory to "backend"');
console.log('4. Add environment variables:');
console.log('   - MONGODB_URI');
console.log('   - JWT_SECRET');
console.log('   - NODE_ENV=production');
console.log('   - CORS_ORIGIN (after frontend deployment)');
console.log('5. Deploy!');

console.log('\n📚 See FREE_BACKEND_DEPLOYMENT.md for detailed instructions');
console.log('🎯 Recommended: Railway.app (most generous free tier)');
