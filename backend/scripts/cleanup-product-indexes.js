const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupProductIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/prima-erp');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Get current indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Fields that should exist in our new simplified schema
    const validFields = ['name', 'hsnCode', 'gstRate', 'createdAt', 'updatedAt', '_id'];
    
    // Find indexes that contain invalid fields
    const indexesToDrop = [];
    indexes.forEach(index => {
      const indexFields = Object.keys(index.key);
      const hasInvalidFields = indexFields.some(field => !validFields.includes(field));
      
      // Don't drop the default _id index
      if (hasInvalidFields && index.name !== '_id_') {
        indexesToDrop.push(index.name);
      }
    });
    
    console.log('\n🔧 Indexes to drop:', indexesToDrop);
    
    // Drop invalid indexes
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${indexName}: ${error.message}`);
      }
    }
    
    // Create the correct indexes for our new schema
    console.log('\n🔧 Creating new indexes...');
    
    try {
      await collection.createIndex({ name: 1 });
      console.log('✅ Created index: name_1');
    } catch (error) {
      console.log(`⚠️  Index name_1 may already exist: ${error.message}`);
    }
    
    try {
      await collection.createIndex({ hsnCode: 1 });
      console.log('✅ Created index: hsnCode_1');
    } catch (error) {
      console.log(`⚠️  Index hsnCode_1 may already exist: ${error.message}`);
    }
    
    try {
      await collection.createIndex({ createdAt: -1 });
      console.log('✅ Created index: createdAt_-1');
    } catch (error) {
      console.log(`⚠️  Index createdAt_-1 may already exist: ${error.message}`);
    }
    
    try {
      await collection.createIndex({ name: 1, hsnCode: 1 });
      console.log('✅ Created index: name_1_hsnCode_1');
    } catch (error) {
      console.log(`⚠️  Index name_1_hsnCode_1 may already exist: ${error.message}`);
    }
    
    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Index cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupProductIndexes();
