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
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.status(201).json({ purchase });
  } catch (error) {
    console.error("Error creating purchase:", error);
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
