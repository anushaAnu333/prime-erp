import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Sale from '../../../lib/models/Sale';
import Customer from '../../../lib/models/Customer';
import Product from '../../../lib/models/Product';
import Stock from '../../../lib/models/Stock';

// GET /api/sales - Get all sales with filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const customer = searchParams.get("customer") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "";
    const company = searchParams.get("company") || "";
    const type = searchParams.get("type") || "Sale";

    // Build query
    let query = {};

    // Add customer filter
    if (customer) {
      query.customerName = { $regex: customer, $options: "i" };
    }

    // Add customer ID filter
    if (searchParams.get("customerId")) {
      query.customerId = searchParams.get("customerId");
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

    return NextResponse.json({
      sales: formattedSales,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create sale
export async function POST(request) {
  try {
    await connectDB();
    
    const { customerId, customerName, items, discount = 0, date, notes = "", type = "Sale", originalSaleId, againstSaleId } = await request.json();
    
    // Validate required fields from request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Items are required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "Customer ID is required for sales" },
        { status: 400 }
      );
    }
    
    // Fetch customer details if not already fetched
    if (!customer && finalCustomerId) {
      customer = await Customer.findById(finalCustomerId);
      if (!customer) {
        console.error("Customer not found with ID:", finalCustomerId);
        return NextResponse.json(
          { message: "Customer not found" },
          { status: 404 }
        );
      }
    }
    
    // If still no customer data, return error
    if (!customer) {
      console.error("No customer data available");
      return NextResponse.json(
        { message: "Customer information is required" },
        { status: 400 }
      );
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
        
        // Get GST rate from product database
        let gstRate = 18; // Default fallback
        try {
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
      if (isNaN(saleDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format" },
          { status: 400 }
        );
      }
    } else {
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
      deliveryAgent: "Default Agent",
      companyId: "PRIMA-SM",
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      type,
      ...(originalSaleId && { originalSaleId }),
      ...(againstSaleId && { originalSaleId: againstSaleId })
    };
    
    const sale = new Sale(saleData);
    await sale.save();
    
    // Update stock for each item in the sale
    try {
      for (const item of processedItems) {
        let stock = await Stock.findOne({ 
          product: { $regex: new RegExp(item.product, 'i') },
          unit: item.unit 
        });
        
        if (stock) {
          if (type === "Sale") {
            stock.totalSales += item.qty;
            stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
            stock.stockAvailable = stock.closingStock - stock.stockGiven;
            
            stock.movements.push({
              type: "sale",
              quantity: -item.qty,
              reference: `${sale.invoiceNo} - ${finalCustomerName}`,
              referenceId: sale._id.toString(),
              referenceModel: "Sale",
              notes: `Sale to ${finalCustomerName} - ${sale.invoiceNo}`
            });
          } else if (type === "Sale Return") {
            stock.totalSales -= item.qty;
            stock.salesReturns += item.qty;
            stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
            stock.stockAvailable = stock.closingStock - stock.stockGiven;
            
            stock.movements.push({
              type: "sale_return",
              quantity: item.qty,
              reference: `${sale.invoiceNo} - ${finalCustomerName}`,
              referenceId: sale._id.toString(),
              referenceModel: "Sale",
              notes: `Sale return from ${finalCustomerName} - ${sale.invoiceNo}`
            });
          }
          
          stock.lastUpdated = new Date();
          await stock.save();
        }
      }
    } catch (stockError) {
      console.error("Error updating stock:", stockError);
    }
    
    return NextResponse.json(
      { 
        success: true,
        sale: {
          id: sale._id,
          invoiceNumber: sale.invoiceNo,
          total: sale.total,
          status: "Created successfully"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sale:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
