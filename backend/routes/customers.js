const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { connectDB } = require("../lib/mongodb");

// GET /api/customers - Get all customers
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 20, search = "", company = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (company) {
      query.companyId = company;
    }

    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      customers,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// POST /api/customers - Create new customer
router.post("/", async (req, res) => {
  try {
    await connectDB();

    const {
      name,
      address,
      shopName,
      phoneNumber,
      companyId,
      currentBalance = 0,
    } = req.body;

    // Validate required fields
    if (!name || !address || !shopName || !phoneNumber) {
      return res.status(400).json({
        message: "Name, address, shop name, and phone number are required",
      });
    }

    // Generate customer code
    const lastCustomer = await Customer.findOne().sort({ customerCode: -1 });
    let nextNumber = 1;

    if (lastCustomer && lastCustomer.customerCode) {
      const lastNumber = parseInt(
        lastCustomer.customerCode.replace("CUST", "")
      );
      nextNumber = lastNumber + 1;
    }

    const customerCode = `CUST${nextNumber.toString().padStart(3, "0")}`;

    // Handle empty companyId - convert to null
    const finalCompanyId =
      companyId && companyId.trim() !== "" ? companyId : null;

    // Create new customer
    const customer = new Customer({
      customerCode: customerCode,
      name: name,
      address: address,
      shopName: shopName,
      phoneNumber: phoneNumber,
      companyId: finalCompanyId,
      currentBalance: currentBalance,
    });

    await customer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Failed to create customer" });
  }
});

// PUT /api/customers/:id - Update customer
router.put("/:id", async (req, res) => {
  try {
    await connectDB();

    const { name, address, shopName, phoneNumber, companyId, currentBalance } =
      req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, address, shopName, phoneNumber, companyId, currentBalance },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Customer deleted successfully",
      customer,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

module.exports = router;
