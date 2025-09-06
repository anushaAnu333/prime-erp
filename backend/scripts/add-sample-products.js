const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  { name: "dosa", hsnCode: "1001" },
  { name: "idli", hsnCode: "1002" },
  { name: "chapati", hsnCode: "1003" },
  { name: "parata", hsnCode: "1004" },
  { name: "paneer", hsnCode: "1005" },
  { name: "green peas", hsnCode: "1006" },
];

// Function to generate unique product code
const generateProductCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PROD${timestamp}${random}`;
};

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prima-erp');
    console.log('Connected to MongoDB');

    // Clear existing products (optional - remove this if you want to keep existing products)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    const productsToInsert = [];

    for (const product of products) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${product.name}$`, 'i') } 
      });

      if (existingProduct) {
        console.log(`Product "${product.name}" already exists, skipping...`);
        continue;
      }

      // Generate unique product code
      let productCode = generateProductCode();
      let existingProductCode = await Product.findOne({ productCode });
      while (existingProductCode) {
        productCode = generateProductCode();
        existingProductCode = await Product.findOne({ productCode });
      }

      productsToInsert.push({
        productCode: productCode,
        name: product.name,
        hsnCode: product.hsnCode,
        gstRate: 5, // Default GST rate of 5%
      });
    }

    if (productsToInsert.length > 0) {
      // Insert products
      const insertedProducts = await Product.insertMany(productsToInsert);
      console.log(`Successfully inserted ${insertedProducts.length} products:`);
      
      insertedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - Code: ${product.productCode} - HSN: ${product.hsnCode}`);
      });
    } else {
      console.log('No new products to insert - all products already exist');
    }

  } catch (error) {
    console.error('Error adding sample products:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
addSampleProducts();


