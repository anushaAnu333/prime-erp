const mongoose = require('mongoose');
require('dotenv').config();

async function fixProductIndexes() {
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
    
    // Check if productCode index exists
    const productCodeIndex = indexes.find(index => index.key.productCode);
    
    if (productCodeIndex) {
      console.log('\n🔧 Dropping old productCode index...');
      await collection.dropIndex('productCode_1');
      console.log('✅ Successfully dropped productCode index');
    } else {
      console.log('\n✅ No productCode index found - already clean');
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

fixProductIndexes();
