#!/usr/bin/env node

/**
 * Backend Testing Script
 * Tests if your backend is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Backend for Deployment\n');

const backendPath = path.join(__dirname, 'backend');

// Test 1: Check required files
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'server.js',
  'env.example'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(backendPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

// Test 2: Check package.json
console.log('\n📦 Checking package.json...');
const packageJsonPath = path.join(backendPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check start script
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log(`   ✅ Start script: ${packageJson.scripts.start}`);
  } else {
    console.log('   ❌ No start script found!');
    allFilesExist = false;
  }
  
  // Check dependencies
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  const deps = Object.keys(packageJson.dependencies || {});
  
  requiredDeps.forEach(dep => {
    if (deps.includes(dep)) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING!`);
      allFilesExist = false;
    }
  });
}

// Test 3: Check environment variables
console.log('\n🔧 Checking environment variables...');
const envExamplePath = path.join(backendPath, 'env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`   ✅ ${envVar}`);
    } else {
      console.log(`   ❌ ${envVar} - MISSING!`);
      allFilesExist = false;
    }
  });
}

// Test 4: Check server.js structure
console.log('\n🖥️  Checking server.js...');
const serverPath = path.join(backendPath, 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  const requiredElements = [
    'express',
    'mongoose',
    'cors',
    'dotenv',
    'app.listen'
  ];
  
  requiredElements.forEach(element => {
    if (serverContent.includes(element)) {
      console.log(`   ✅ ${element}`);
    } else {
      console.log(`   ❌ ${element} - MISSING!`);
      allFilesExist = false;
    }
  });
}

// Summary
console.log('\n📊 Test Summary:');
if (allFilesExist) {
  console.log('🎉 Your backend is ready for deployment!');
  console.log('\n🚀 Next steps:');
  console.log('1. Choose a deployment platform (Railway recommended)');
  console.log('2. Set up your MongoDB Atlas database');
  console.log('3. Deploy your backend');
  console.log('4. Update frontend with backend URL');
} else {
  console.log('❌ Your backend needs some fixes before deployment.');
  console.log('Please address the missing items above.');
}

console.log('\n📚 For detailed deployment instructions, see:');
console.log('   - FREE_BACKEND_DEPLOYMENT.md');
console.log('   - DEPLOYMENT_GUIDE.md');
