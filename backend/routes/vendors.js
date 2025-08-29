const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const { connectDB } = require("../lib/mongodb");

// Get all vendors
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Vendor.countDocuments();

    // Get vendors with pagination
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      vendors,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single vendor
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create vendor
router.post("/", async (req, res) => {
  try {
    await connectDB();
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json({ vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update vendor
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ vendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete vendor
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
