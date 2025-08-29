const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const { connectDB } = require("../lib/mongodb");

// Get all sales with filtering
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const customer = req.query.customer || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const paymentStatus = req.query.paymentStatus || "";
    const deliveryStatus = req.query.deliveryStatus || "";
    const company = req.query.company || "";
    const type = req.query.type || "Sale";

    // Build query
    let query = {};

    // Add customer filter
    if (customer) {
      query.customerName = { $regex: customer, $options: "i" };
    }

    // Add company filter
    if (company) {
      query.companyId = company;
    }

    // Add payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Add delivery status filter
    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }

    // Add type filter - only filter if type is "Sale Return"
    // For "Sale" type, we'll include all records (including legacy ones without type field)
    if (type === "Sale Return") {
      query.type = type;
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
    const total = await Sale.countDocuments(query);

    // Get sales with pagination and filtering
    const sales = await Sale.find(query)
      .populate("customerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format response to match frontend expectations
    const formattedSales = sales.map((sale) => ({
      id: sale._id.toString(),
      _id: sale._id.toString(),
      invoiceNumber: sale.invoiceNo,
      invoiceDate: sale.date,
      customer: {
        name: sale.customerName,
        shopName: sale.shopName,
        phoneNumber: sale.phoneNumber,
      },
      items: sale.items || [],
      finalAmount: sale.total,
      deliveryAgent: sale.deliveryAgent,
      companyId: sale.companyId,
      paymentStatus: sale.paymentStatus || "Pending",
      deliveryStatus: sale.deliveryStatus || "Pending",
      type: sale.type || "Sale",
      originalSaleId: sale.originalSaleId,
    }));

    res.json({
      sales: formattedSales,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single sale
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const sale = await Sale.findById(req.params.id).populate("customerId");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Format response to match frontend expectations
    const formattedSale = {
      id: sale._id.toString(),
      _id: sale._id.toString(),
      invoiceNumber: sale.invoiceNo,
      invoiceDate: sale.date,
      customer: {
        name: sale.customerName,
        shopName: sale.shopName,
        phoneNumber: sale.phoneNumber,
        address: sale.customerAddress,
      },
      items: sale.items || [],
      finalAmount: sale.total,
      subtotal: sale.items ? sale.items.reduce((sum, item) => sum + (item.taxableValue || 0), 0) : 0,
      totalGST: sale.items ? sale.items.reduce((sum, item) => sum + (item.gst || 0), 0) : 0,
      discount: sale.discount || 0,
      deliveryAgent: sale.deliveryAgent,
      companyId: sale.companyId,
      paymentStatus: sale.paymentStatus || "Pending",
      deliveryStatus: sale.deliveryStatus || "Pending",
      type: sale.type || "Sale",
      originalSaleId: sale.originalSaleId,
      notes: sale.notes || "",
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };

    res.json({ sale: formattedSale });
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create sale
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json({ sale });
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update sale
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json({ sale });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete sale
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
