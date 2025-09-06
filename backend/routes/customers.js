const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const { connectDB } = require("../lib/mongodb");

// GET /api/customers - Get all customers
router.get("/", async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 20, search = "", company = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
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

// GET /api/customers/:id/transactions - Get customer transactions
router.get("/:id/transactions", async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all sales for this customer with payments
    const sales = await Sale.find({
      customerId: req.params.id,
      deliveryStatus: { $ne: "Cancelled" }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Sale.countDocuments({
      customerId: req.params.id,
      deliveryStatus: { $ne: "Cancelled" }
    });

    // Flatten all transactions from all sales
    const transactions = [];
    sales.forEach(sale => {
      if (sale.payments && sale.payments.length > 0) {
        sale.payments.forEach(payment => {
          transactions.push({
            id: `${sale._id}_${payment._id}`,
            saleId: sale._id,
            invoiceNumber: sale.invoiceNo,
            invoiceDate: sale.date,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode,
            amountPaid: payment.amountPaid,
            referenceNumber: payment.referenceNumber,
            notes: payment.notes,
            totalAmount: sale.total,
            paymentStatus: sale.paymentStatus
          });
        });
      }
    });

    // Sort transactions by payment date (newest first)
    transactions.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    res.json({
      transactions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    res.status(500).json({ message: "Failed to fetch customer transactions" });
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
      email,
      currentBalance = 0,
    } = req.body;

    // Validate required fields
    if (!name || !address || !shopName || !phoneNumber) {
      return res.status(400).json({
        message: "Name, address, shop name, and phone number are required",
      });
    }

    // Generate customer code with uniqueness check
    const generateCustomerCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `CUST${timestamp}${random}`;
    };

    let customerCode = generateCustomerCode();

    // Ensure customer code is unique
    let existingCustomer = await Customer.findOne({ customerCode });
    while (existingCustomer) {
      customerCode = generateCustomerCode();
      existingCustomer = await Customer.findOne({ customerCode });
    }

    // Create new customer
    const customer = new Customer({
      customerCode: customerCode,
      name: name,
      address: address,
      shopName: shopName,
      phoneNumber: phoneNumber,
      email: email || null,
      currentBalance: currentBalance,
    });

    await customer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Customer code already exists" 
      });
    }
    
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
