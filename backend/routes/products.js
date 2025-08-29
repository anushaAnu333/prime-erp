const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { connectDB } = require("../lib/mongodb");

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    await connectDB();
    
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build query - removed isActive filter since Product model doesn't have it
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { productCode: { $regex: search, $options: "i" } },
        { hsnCode: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      products,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get product by ID
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST /api/products - Create new product
router.post("/", async (req, res) => {
  try {
    await connectDB();

    const { name, hsnCode, gstRate } = req.body;

    // Validate required fields
    if (!name || !hsnCode || !gstRate) {
      return res
        .status(400)
        .json({ message: "Name, HSN Code, and GST Rate are required" });
    }

    // Generate product code
    const generateProductCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `PROD${timestamp}${random}`;
    };

    let productCode = generateProductCode();

    // Ensure product code is unique
    let existingProduct = await Product.findOne({ productCode });
    while (existingProduct) {
      productCode = generateProductCode();
      existingProduct = await Product.findOne({ productCode });
    }

    // Create new product
    const product = new Product({
      productCode: productCode,
      name: name,
      hsnCode: hsnCode,
      gstRate: gstRate,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res) => {
  try {
    await connectDB();

    const { name, hsnCode, gstRate } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, hsnCode, gstRate },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
