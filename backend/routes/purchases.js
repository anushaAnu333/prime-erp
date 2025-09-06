const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const { connectDB } = require("../lib/mongodb");

// Get all purchases with filtering
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const vendor = req.query.vendor || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const company = req.query.company || "";
    const type = req.query.type || "Purchase";

    // Build query
    let query = {};

    // Add vendor filter
    if (vendor) {
      query.vendorName = { $regex: vendor, $options: "i" };
    }

    // Add type filter - only filter if type is "Purchase Return"
    // For "Purchase" type, we'll include all records (including legacy ones without type field)
    if (type === "Purchase Return") {
      query.purchaseType = type;
    }

    // Add date filters
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await Purchase.countDocuments(query);

    // Get purchases with pagination and filtering
    const purchases = await Purchase.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format response to match frontend expectations
    const formattedPurchases = purchases.map((purchase) => ({
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      purchaseNumber: purchase.purchaseNumber,
      date: purchase.date,
      vendor: {
        name: purchase.vendorName,
        vendorName: purchase.vendorName,
        phoneNumber: purchase.vendorDetails?.phone,
        address: purchase.vendorDetails?.address,
      },
      items: purchase.items || [],
      total: purchase.total,
      subtotal: purchase.items
        ? purchase.items.reduce(
            (sum, item) => sum + (item.taxableValue || 0),
            0
          )
        : 0,
      totalGST: purchase.items
        ? purchase.items.reduce((sum, item) => sum + (item.gst || 0), 0)
        : 0,
      discount: purchase.discount || 0,
      supplierInvoiceNumber: purchase.supplierInvoiceNumber,
      supplierInvoiceDate: purchase.supplierInvoiceDate,
      status: purchase.status || "Pending",
      type: purchase.purchaseType || "Purchase",
      againstPurchaseId: purchase.againstPurchaseId,
      paymentStatus: purchase.paymentStatus || "Pending",
      paymentMode: purchase.paymentMode,
      amountPaid: purchase.amountPaid || 0,
      deliveryStatus: purchase.deliveryStatus || "Pending",
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    }));

    res.json({
      purchases: formattedPurchases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single purchase
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Format response to match frontend expectations
    const formattedPurchase = {
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      purchaseNumber: purchase.purchaseNumber,
      date: purchase.date,
      vendor: {
        name: purchase.vendorName,
        vendorName: purchase.vendorName,
        phoneNumber: purchase.vendorDetails?.phone,
        address: purchase.vendorDetails?.address,
      },
      items: purchase.items || [],
      total: purchase.total,
      subtotal: purchase.items
        ? purchase.items.reduce(
            (sum, item) => sum + (item.taxableValue || 0),
            0
          )
        : 0,
      totalGST: purchase.items
        ? purchase.items.reduce((sum, item) => sum + (item.gst || 0), 0)
        : 0,
      discount: purchase.discount || 0,
      supplierInvoiceNumber: purchase.supplierInvoiceNumber,
      supplierInvoiceDate: purchase.supplierInvoiceDate,
      status: purchase.status || "Pending",
      type: purchase.purchaseType || "Purchase",
      againstPurchaseId: purchase.againstPurchaseId,
      paymentStatus: purchase.paymentStatus || "Pending",
      paymentMode: purchase.paymentMode,
      amountPaid: purchase.amountPaid || 0,
      deliveryStatus: purchase.deliveryStatus || "Pending",
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };

    res.json({ purchase: formattedPurchase });
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create purchase
router.post("/", async (req, res) => {
  try {
    await connectDB();
    
    const { vendorName, supplierInvoiceNumber, supplierInvoiceDate, items, discount = 0, purchaseType = "Purchase" } = req.body;
    
    // Validate required fields
    if (!vendorName) {
      return res.status(400).json({ message: "Vendor name is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }
    
    // Fetch vendor details
    const Vendor = require("../models/Vendor");
    const vendor = await Vendor.findOne({ vendorName: { $regex: new RegExp(vendorName, 'i') } });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    
    // Generate purchase number
    const lastPurchase = await Purchase.findOne().sort({ createdAt: -1 });
    let purchaseNumber = "PUR-0001";
    if (lastPurchase && lastPurchase.purchaseNumber) {
      // Extract number from various formats
      const match = lastPurchase.purchaseNumber.match(/(\d+)$/);
      if (match) {
        const lastNumber = parseInt(match[1]) || 0;
        purchaseNumber = `PUR-${String(lastNumber + 1).padStart(4, "0")}`;
      } else {
        // If no number found, generate with timestamp
        const timestamp = Date.now().toString().slice(-6);
        purchaseNumber = `PUR-${timestamp}`;
      }
    }
    
    // Process items with tax calculations
    const processedItems = await Promise.all(items.map(async item => {
      const { product, qty, rate, unit, hsnCode, expiryDate } = item;
      
      // Get GST rate from product database
      let gstRate = 18; // Default fallback
      try {
        const Product = require("../models/Product");
        const productData = await Product.findOne({ name: { $regex: new RegExp(product, 'i') } });
        if (productData && productData.gstRate) {
          gstRate = productData.gstRate;
        }
      } catch (productError) {
        console.error("Error fetching product GST rate:", productError);
      }
      
      const taxableValue = qty * rate;
      const gstAmount = (taxableValue * gstRate) / 100;
      const invoiceValue = taxableValue + gstAmount;
      
      return {
        product,
        qty: Number(qty),
        rate: Number(rate),
        unit,
        hsnCode,
        expiryDate: new Date(expiryDate),
        taxableValue: Number(taxableValue.toFixed(2)),
        gst: Number(gstAmount.toFixed(2)),
        invoiceValue: Number(invoiceValue.toFixed(2))
      };
    }));
    
    // Calculate total
    const subtotal = processedItems.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalGST = processedItems.reduce((sum, item) => sum + item.gst, 0);
    const total = subtotal + totalGST - discount;
    
    // Create purchase object with all required fields
    const purchaseData = {
      purchaseNumber,
      date: new Date(),
      vendorName: vendor.vendorName,
      vendorDetails: {
        name: vendor.vendorName,
        address: vendor.address,
        phone: vendor.phone,
        gstNumber: vendor.gstNumber
      },
      supplierInvoiceNumber: supplierInvoiceNumber || "",
      supplierInvoiceDate: supplierInvoiceDate ? new Date(supplierInvoiceDate) : null,
      items: processedItems,
      discount: Number(discount),
      total: Number(total.toFixed(2)),
      purchaseType,
      status: "Pending",
      paymentStatus: "Pending",
      deliveryStatus: "Pending"
    };
    
    const purchase = new Purchase(purchaseData);
    await purchase.save();
    
    // Update stock for each item in the purchase
    try {
      const Stock = require("../models/Stock");
      
      for (const item of processedItems) {
        // Find existing stock for this product
        let stock = await Stock.findOne({ 
          product: { $regex: new RegExp(item.product, 'i') },
          unit: item.unit 
        });
        
        if (stock) {
          // Update existing stock
          stock.totalPurchases += item.qty;
          stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
          stock.stockAvailable = stock.closingStock - stock.stockGiven;
          stock.lastUpdated = new Date();
          
          // Add movement record
          stock.movements.push({
            type: "purchase",
            quantity: item.qty,
            reference: `${purchase.purchaseNumber} - ${vendor.vendorName}`,
            referenceId: purchase._id.toString(),
            referenceModel: "Purchase",
            notes: `Purchase from ${vendor.vendorName} - ${purchase.purchaseNumber}`
          });
          
          await stock.save();
        } else {
          // Create new stock entry
          const newStock = new Stock({
            product: item.product,
            unit: item.unit,
            openingStock: 0,
            totalPurchases: item.qty,
            totalSales: 0,
            closingStock: item.qty,
            stockGiven: 0,
            stockDelivered: 0,
            salesReturns: 0,
            stockAvailable: item.qty,
            minimumStock: 10, // Default minimum stock
            expiryDate: item.expiryDate,
            isLowStock: item.qty <= 10,
            isExpired: item.expiryDate ? new Date() > item.expiryDate : false,
            isActive: true,
            movements: [{
              type: "purchase",
              quantity: item.qty,
              reference: `${purchase.purchaseNumber} - ${vendor.vendorName}`,
              referenceId: purchase._id.toString(),
              referenceModel: "Purchase",
              notes: `Purchase from ${vendor.vendorName} - ${purchase.purchaseNumber}`
            }],
            agentStocks: [],
            lastUpdated: new Date()
          });
          
          await newStock.save();
        }
      }
    } catch (stockError) {
      console.error("Error updating stock:", stockError);
      // Don't fail the purchase if stock update fails, just log it
    }
    
    res.status(201).json({ 
      success: true,
      purchaseNumber: purchase.purchaseNumber,
      total: purchase.total,
      _id: purchase._id,
      id: purchase._id
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update purchase
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ purchase });
  } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete purchase
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
