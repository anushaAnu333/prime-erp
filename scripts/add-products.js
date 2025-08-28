const { connectDB } = require("../lib/mongodb.js");
const Product = require("../models/Product.js");

const products = [
  {
    name: "Dosa",
    hsnCode: "1905",
    gstRate: 5,
  },
  {
    name: "Idli",
    hsnCode: "1905",
    gstRate: 5,
  },
  {
    name: "Green Peas",
    hsnCode: "0710",
    gstRate: 5,
  },
  {
    name: "Paneer",
    hsnCode: "0406",
    gstRate: 5,
  },
  {
    name: "Parata",
    hsnCode: "1905",
    gstRate: 5,
  },
  {
    name: "Green Peas",
    hsnCode: "0710",
    gstRate: 5,
  },
];

const generateProductCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PROD${timestamp}${random}`;
};

async function addProducts() {
  try {
    await connectDB();
    console.log("Connected to database");

    for (const productData of products) {
      // Generate unique product code
      let productCode = generateProductCode();
      let existingProduct = await Product.findOne({ productCode });
      while (existingProduct) {
        productCode = generateProductCode();
        existingProduct = await Product.findOne({ productCode });
      }

      // Check if product with same name already exists
      const existingProductByName = await Product.findOne({
        name: productData.name,
        isActive: true,
      });

      if (existingProductByName) {
        console.log(
          `Product "${productData.name}" already exists, skipping...`
        );
        continue;
      }

      // Create new product
      const product = new Product({
        productCode: productCode,
        name: productData.name,
        hsnCode: productData.hsnCode,
        gstRate: productData.gstRate,
      });

      await product.save();
      console.log(`✅ Added product: ${productData.name} (${productCode})`);
    }

    console.log("🎉 All products added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding products:", error);
    process.exit(1);
  }
}

addProducts();
