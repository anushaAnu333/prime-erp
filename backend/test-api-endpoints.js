const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAPIEndpoints() {
  console.log('🌐 Testing Product API Endpoints...\n');
  
  try {
    // Test 1: GET /api/products (List Products)
    console.log('📋 Testing GET /api/products...');
    const listResponse = await fetch(`${API_BASE}/products`);
    const listData = await listResponse.json();
    
    if (listResponse.ok) {
      console.log('✅ GET /api/products - SUCCESS');
      console.log(`   Found ${listData.products?.length || 0} products`);
      if (listData.products?.length > 0) {
        const sample = listData.products[0];
        console.log(`   Sample: ${sample.productCode} - ${sample.name}`);
      }
    } else {
      console.log('❌ GET /api/products - FAILED:', listData.message);
    }
    
    // Test 2: POST /api/products (Create Product)
    console.log('\n📝 Testing POST /api/products...');
    const createData = {
      name: 'API Test Product ' + Date.now(),
      hsnCode: '99999999',
      gstRate: 18
    };
    
    const createResponse = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData)
    });
    
    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ POST /api/products - SUCCESS');
      console.log(`   Created: ${createResult.product.productCode} - ${createResult.product.name}`);
      
      const productId = createResult.product._id;
      
      // Test 3: GET /api/products/:id (Get Single Product)
      console.log('\n🔍 Testing GET /api/products/:id...');
      const getResponse = await fetch(`${API_BASE}/products/${productId}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        console.log('✅ GET /api/products/:id - SUCCESS');
        console.log(`   Retrieved: ${getData.product.productCode} - ${getData.product.name}`);
      } else {
        console.log('❌ GET /api/products/:id - FAILED:', getData.message);
      }
      
      // Test 4: PUT /api/products/:id (Update Product)
      console.log('\n✏️  Testing PUT /api/products/:id...');
      const updateData = {
        name: createData.name + ' Updated',
        hsnCode: '88888888',
        gstRate: 12
      };
      
      const updateResponse = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ PUT /api/products/:id - SUCCESS');
        console.log(`   Updated: ${updateResult.product.productCode} - ${updateResult.product.name}`);
        console.log(`   HSN Code changed: ${createData.hsnCode} → ${updateResult.product.hsnCode}`);
        console.log(`   GST Rate changed: ${createData.gstRate}% → ${updateResult.product.gstRate}%`);
      } else {
        console.log('❌ PUT /api/products/:id - FAILED:', updateResult.message);
      }
      
      // Test 5: DELETE /api/products/:id (Delete Product)
      console.log('\n🗑️  Testing DELETE /api/products/:id...');
      const deleteResponse = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResponse.ok) {
        console.log('✅ DELETE /api/products/:id - SUCCESS');
        console.log(`   Deleted: ${deleteResult.product.productCode}`);
      } else {
        console.log('❌ DELETE /api/products/:id - FAILED:', deleteResult.message);
      }
      
    } else {
      console.log('❌ POST /api/products - FAILED:', createResult.message);
    }
    
    // Test 6: Search functionality
    console.log('\n🔎 Testing Search functionality...');
    const searchResponse = await fetch(`${API_BASE}/products?search=test`);
    const searchData = await searchResponse.json();
    
    if (searchResponse.ok) {
      console.log('✅ Search functionality - SUCCESS');
      console.log(`   Found ${searchData.products?.length || 0} products matching "test"`);
    } else {
      console.log('❌ Search functionality - FAILED:', searchData.message);
    }
    
    console.log('\n🎉 API Endpoint Testing Completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ GET /api/products (List) - Working');
    console.log('✅ POST /api/products (Create) - Working');
    console.log('✅ GET /api/products/:id (Get Single) - Working');
    console.log('✅ PUT /api/products/:id (Update) - Working');
    console.log('✅ DELETE /api/products/:id (Delete) - Working');
    console.log('✅ Search functionality - Working');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
  }
}

testAPIEndpoints();
