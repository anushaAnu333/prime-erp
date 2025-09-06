const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testLogin() {
  console.log('🔍 Testing login endpoint...');
  
  try {
    // First test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    };
    
    const healthResponse = await makeRequest(healthOptions);
    console.log(`✅ Health check: ${healthResponse.statusCode}`);
    console.log('Response:', healthResponse.body);
    
    // Now test login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginData = JSON.stringify({
      email: 'admin@prima.com',
      password: 'admin123',
      rememberMe: false
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`Status: ${loginResponse.statusCode}`);
    console.log('Response:', loginResponse.body);
    
    if (loginResponse.statusCode === 404) {
      console.log('\n❌ 404 Error - Route not found!');
      console.log('This means the /api/auth/login endpoint is not properly configured.');
    } else if (loginResponse.statusCode === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log(`❌ Login failed with status ${loginResponse.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testLogin();
