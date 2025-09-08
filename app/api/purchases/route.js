import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import Vendor from "@/lib/models/Vendor";
import Product from "@/lib/models/Product";
import Stock from "@/lib/models/Stock";

// GET /api/purchases - Get all purchases with filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const vendor = searchParams.get("vendor") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const company = searchParams.get("company") || "";
    const type = searchParams.get("type") || "Purchase";

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

    return NextResponse.json({
      purchases: formattedPurchases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create purchase
export async function POST(request) {
  try {
    await connectDB();
    
    const { vendorName, supplierInvoiceNumber, supplierInvoiceDate, items, discount = 0, purchaseType = "Purchase" } = await request.json();
    
    // Validate required fields
    if (!vendorName) {
      return NextResponse.json(
        { message: "Vendor name is required" },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Items are required" },
        { status: 400 }
      );
    }
    
    // Fetch vendor details
    const vendor = await Vendor.findOne({ vendorName: { $regex: new RegExp(vendorName, 'i') } });
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
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
        const productData = await Product.findOne({ name: { $regex: new RegExp(product, 'i') } });
        if (productData && productData.gstRate) {
          gstRate = productData.gstRate;
        }
      } catch (productError) {
        // Error fetching product GST rate
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
        gstRate: Number(gstRate),
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
      // Don't fail the purchase if stock update fails, just log it
    }
    
    return NextResponse.json(
      { 
        success: true,
        purchaseNumber: purchase.purchaseNumber,
        total: purchase.total,
        _id: purchase._id,
        id: purchase._id
      },
      { status: 201 }
    );
  } catch (error) {
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
