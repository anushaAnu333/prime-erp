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

    // Add customer ID filter
    if (req.query.customerId) {
      query.customerId = req.query.customerId;
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
      payments: sale.payments || [],
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
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
      // 🔧 ADD MISSING PAYMENT FIELDS
      paymentMode: sale.paymentMode,
      amountPaid: sale.amountPaid,
      payments: sale.payments || [],
      referenceNumber: sale.referenceNumber,
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
    
    const { customerId, customerName, items, discount = 0, date, notes = "", type = "Sale", originalSaleId, againstSaleId } = req.body;
    
    // Validate required fields from request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }
    
    let customer = null;
    let finalCustomerId = customerId;
    let finalCustomerName = customerName;
    
    // For sale returns, we can get customer info from original sale
    if (type === "Sale Return" && (originalSaleId || againstSaleId)) {
      const originalSaleIdToUse = originalSaleId || againstSaleId;
      const originalSale = await Sale.findById(originalSaleIdToUse);
      if (originalSale) {
        finalCustomerId = originalSale.customerId;
        finalCustomerName = originalSale.customerName;
        // Try to get customer details from the original sale
        if (originalSale.customerId) {
          const Customer = require("../models/Customer");
          customer = await Customer.findById(originalSale.customerId);
        }
        // If no customer found, use original sale data
        if (!customer) {
          customer = {
            name: originalSale.customerName,
            shopName: originalSale.shopName,
            phoneNumber: originalSale.phoneNumber,
            address: originalSale.customerAddress
          };
        }
      }
    }
    
    // For regular sales, customer ID is required
    if (type === "Sale" && !finalCustomerId) {
      return res.status(400).json({ message: "Customer ID is required for sales" });
    }
    
    // Fetch customer details if not already fetched
    if (!customer && finalCustomerId) {
      const Customer = require("../models/Customer");
      customer = await Customer.findById(finalCustomerId);
      if (!customer) {
        console.error("Customer not found with ID:", finalCustomerId);
        return res.status(404).json({ message: "Customer not found" });
      }
      console.log("Found customer:", {
        id: customer._id,
        name: customer.name,
        shopName: customer.shopName,
        phoneNumber: customer.phoneNumber,
        address: customer.address
      });
    }
    
    // If still no customer data, return error
    if (!customer) {
      console.error("No customer data available");
      return res.status(400).json({ message: "Customer information is required" });
    }
    
    // Generate invoice number
    const lastSale = await Sale.findOne().sort({ createdAt: -1 });
    let invoiceNumber;
    
    if (type === "Sale Return") {
      // Generate return number
      invoiceNumber = "RET-0001";
      if (lastSale && lastSale.invoiceNo && lastSale.invoiceNo.startsWith("RET-")) {
        const lastNumber = parseInt(lastSale.invoiceNo.split("-")[1]) || 0;
        invoiceNumber = `RET-${String(lastNumber + 1).padStart(4, "0")}`;
      }
    } else {
      // Generate sale invoice number
      invoiceNumber = "INV-0001";
      if (lastSale && lastSale.invoiceNo && lastSale.invoiceNo.startsWith("INV-")) {
        const lastNumber = parseInt(lastSale.invoiceNo.split("-")[1]) || 0;
        invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
      }
    }
    
    // Process items with tax calculations
    const processedItems = [];
    
    for (const item of items) {
      try {
        const { product, qty, rate, unit, hsnCode, expiryDate } = item;
        
        console.log("Processing item:", { product, qty, rate, unit, hsnCode });
        
        // Get GST rate from product database
        let gstRate = 18; // Default fallback
        try {
          const Product = require("../models/Product");
          const productData = await Product.findOne({ name: { $regex: new RegExp(product, 'i') } });
          if (productData && productData.gstRate) {
            gstRate = productData.gstRate;
            console.log(`Found product ${product} with GST rate: ${gstRate}%`);
          } else {
            console.log(`Product ${product} not found in database, using default GST rate: ${gstRate}%`);
          }
        } catch (productError) {
          console.error("Error fetching product GST rate:", productError);
        }
        
        const taxableValue = qty * rate;
        const gstAmount = (taxableValue * gstRate) / 100;
        const invoiceValue = taxableValue + gstAmount;
        
        const processedItem = {
          product,
          qty: Number(qty),
          rate: Number(rate),
          unit,
          hsnCode,
          expiryDate: new Date(expiryDate),
          taxableValue: Number(taxableValue.toFixed(2)),
          gst: Number(gstAmount.toFixed(2)),
          invoiceValue: Number(invoiceValue.toFixed(2)),
          gstRate
        };
        
        console.log("Processed item:", processedItem);
        processedItems.push(processedItem);
        
      } catch (itemError) {
        console.error("Error processing item:", itemError);
        throw new Error(`Failed to process item: ${item.product}`);
      }
    }
    
    // Calculate total
    const subtotal = processedItems.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalGST = processedItems.reduce((sum, item) => sum + item.gst, 0);
    const total = subtotal + totalGST - discount;
    
    // Handle date validation
    let saleDate;
    if (date) {
      saleDate = new Date(date);
      // Check if the date is valid
      if (isNaN(saleDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    } else {
      // Default to current date if not provided
      saleDate = new Date();
    }

    // Create sale object with all required fields
    const saleData = {
      invoiceNo: invoiceNumber,
      date: saleDate,
      customerId: finalCustomerId,
      customerName: finalCustomerName || customer.name,
      customerAddress: customer.address || "Address not provided",
      shopName: customer.shopName || "Shop name not provided",
      phoneNumber: customer.phoneNumber || "Phone not provided",
      items: processedItems,
      discount: Number(discount),
      total: Number(total.toFixed(2)),
      notes: notes || "",
      deliveryAgent: "Default Agent", // You may want to make this configurable
      companyId: "PRIMA-SM", // You may want to make this configurable
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      type,
      ...(originalSaleId && { originalSaleId }),
      ...(againstSaleId && { originalSaleId: againstSaleId })
    };
    
    console.log("Creating sale with data:", {
      invoiceNo: saleData.invoiceNo,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      itemsCount: saleData.items.length,
      total: saleData.total
    });
    
    const sale = new Sale(saleData);
    await sale.save();
    
    // Update stock for each item in the sale
    try {
      const Stock = require("../models/Stock");
      
      for (const item of processedItems) {
        // Find existing stock for this product
        let stock = await Stock.findOne({ 
          product: { $regex: new RegExp(item.product, 'i') },
          unit: item.unit 
        });
        
        if (stock) {
          // Check if we have enough stock available
          if (stock.stockAvailable < item.qty) {
            console.warn(`Insufficient stock for ${item.product}. Available: ${stock.stockAvailable}, Required: ${item.qty}`);
            // Continue with the sale but log the warning
          }
          
          // Update stock based on sale type
          if (type === "Sale") {
            // Regular sale - reduce stock
            stock.totalSales += item.qty;
            stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
            stock.stockAvailable = stock.closingStock - stock.stockGiven;
            
            // Add movement record
            stock.movements.push({
              type: "sale",
              quantity: -item.qty, // Negative for sales
              reference: `${sale.invoiceNo} - ${finalCustomerName}`,
              referenceId: sale._id.toString(),
              referenceModel: "Sale",
              notes: `Sale to ${finalCustomerName} - ${sale.invoiceNo}`
            });
          } else if (type === "Sale Return") {
            // Sale return - add stock back
            stock.totalSales -= item.qty;
            stock.salesReturns += item.qty;
            stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
            stock.stockAvailable = stock.closingStock - stock.stockGiven;
            
            // Add movement record
            stock.movements.push({
              type: "sale_return",
              quantity: item.qty, // Positive for returns
              reference: `${sale.invoiceNo} - ${finalCustomerName}`,
              referenceId: sale._id.toString(),
              referenceModel: "Sale",
              notes: `Sale return from ${finalCustomerName} - ${sale.invoiceNo}`
            });
          }
          
          stock.lastUpdated = new Date();
          await stock.save();
        } else {
          console.warn(`Stock not found for product: ${item.product} ${item.unit}`);
          // For sale returns, we might want to create stock if it doesn't exist
          if (type === "Sale Return") {
            const newStock = new Stock({
              product: item.product,
              unit: item.unit,
              openingStock: 0,
              totalPurchases: 0,
              totalSales: 0,
              closingStock: item.qty,
              stockGiven: 0,
              stockDelivered: 0,
              salesReturns: item.qty,
              stockAvailable: item.qty,
              minimumStock: 10,
              expiryDate: item.expiryDate,
              isLowStock: item.qty <= 10,
              isExpired: item.expiryDate ? new Date() > item.expiryDate : false,
              isActive: true,
              movements: [{
                type: "sale_return",
                quantity: item.qty,
                reference: `${sale.invoiceNo} - ${finalCustomerName}`,
                referenceId: sale._id.toString(),
                referenceModel: "Sale",
                notes: `Sale return from ${finalCustomerName} - ${sale.invoiceNo}`
              }],
              agentStocks: [],
              lastUpdated: new Date()
            });
            
            await newStock.save();
          }
        }
      }
    } catch (stockError) {
      console.error("Error updating stock:", stockError);
      // Don't fail the sale if stock update fails, just log it
    }
    
    res.status(201).json({ 
      success: true,
      sale: {
        id: sale._id,
        invoiceNumber: sale.invoiceNo,
        total: sale.total,
        status: "Created successfully"
      }
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    
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
