import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Customer from "@/models/Customer";
import { getCurrentUser } from "@/lib/auth";
import { calculateItemTotals } from "@/lib/calculations";

// GET /api/sales/[id] - Get sale details
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    const company = user.companyAccess[0];

    // Build query
    const query = {
      _id: id,
      companyId: company,
    };

    // For agents, only show their own sales
    if (user.role === "agent") {
      query.agentId = user._id;
    }

    // Get sale details
    const sale = await Sale.findOne(query).populate(
      "customerId",
      "name shopName phone address gstNumber"
    );

    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({
      sale: {
        id: sale._id,
        invoiceNumber: sale.invoiceNo,
        invoiceDate: sale.date,
        customerId: sale.customerId,
        customerDetails: {
          name: sale.customerName,
          shopName: sale.shopName,
          phone: sale.phoneNumber,
          address: sale.customerAddress,
        },
        items: sale.items,
        subtotal: sale.items.reduce((sum, item) => sum + item.taxableValue, 0),
        totalGST: sale.items.reduce((sum, item) => sum + item.gst, 0),
        invoiceValue: sale.items.reduce(
          (sum, item) => sum + item.invoiceValue,
          0
        ),
        discount: sale.discount,
        finalAmount: sale.total,
        paymentStatus: sale.paymentStatus || "Pending",
        deliveryStatus: sale.deliveryStatus || "Pending",
        agentId: sale.deliveryAgent,
        notes: sale.notes,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching sale details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Update sale
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    const body = await request.json();
    const {
      customerId,
      items,
      discount = 0,
      notes = "",
      invoiceDate,
      paymentStatus,
      deliveryStatus,
    } = body;

    // Build query
    const query = {
      _id: id,
      companyId: user.companyAccess[0],
    };

    // For agents, only allow editing their own sales within 1 hour
    if (user.role === "agent") {
      query.agentId = user._id;

      // Check if sale is within 1 hour
      const sale = await Sale.findOne(query);
      if (sale) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (sale.createdAt < oneHourAgo) {
          return NextResponse.json(
            { message: "Cannot edit invoices older than 1 hour" },
            { status: 403 }
          );
        }
      }
    }

    // Find sale
    const sale = await Sale.findOne(query);
    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    // Store old amount for balance adjustment
    const oldAmount = sale.finalAmount;

    // Validate invoice data if items are being updated
    if (items) {
      const validation = validateInvoiceData({
        customerName: sale.customerName, // Use existing customer name
        items,
        discount,
        invoiceDate,
      });
      if (!validation.isValid) {
        return NextResponse.json(
          { message: "Validation failed", errors: validation.errors },
          { status: 400 }
        );
      }
    }

    // Validate status values if provided
    if (
      paymentStatus &&
      !["Pending", "Partial", "Paid"].includes(paymentStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid payment status" },
        { status: 400 }
      );
    }

    if (
      deliveryStatus &&
      !["Pending", "Delivered", "Cancelled"].includes(deliveryStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid delivery status" },
        { status: 400 }
      );
    }

    // Update customer if changed
    if (customerId && customerId !== sale.customerId.toString()) {
      const customer = await Customer.findOne({
        _id: customerId,
        companyId: user.companyAccess[0],
        isActive: true,
      });

      if (!customer) {
        return NextResponse.json(
          { message: "Customer not found" },
          { status: 404 }
        );
      }

      sale.customerId = customerId;
      sale.customerDetails = {
        name: customer.name,
        shopName: customer.shopName,
        address: customer.getFullAddress(),
        phone: customer.phone,
      };
    }

    // Update items if provided
    if (items) {
      const processedItems = [];
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          companyId: user.companyAccess[0],
          isActive: true,
        });

        if (!product) {
          return NextResponse.json(
            { message: `Product not found: ${item.productId}` },
            { status: 404 }
          );
        }

        // Calculate item totals
        const itemTotals = calculateItemTotals(
          product.name, // Use product name
          item.quantity,
          item.rate || product.sellingPrice,
          new Date() // Add expiry date
        );

        processedItems.push({
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
          rate: item.rate || product.sellingPrice,
          amount: itemTotals.amount,
          gstRate: product.gstRate,
          gstAmount: itemTotals.gstAmount,
          totalAmount: itemTotals.totalAmount,
        });
      }

      sale.items = processedItems;
    }

    // Update sale fields
    const updateData = {};
    if (customerId) updateData.customerId = customerId;
    if (items) updateData.items = items;
    if (discount !== undefined) updateData.discount = discount;
    if (notes !== undefined) updateData.notes = notes;
    if (invoiceDate) updateData.date = new Date(invoiceDate);
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    // Recalculate totals if items changed
    if (items) {
      updateData.total =
        items.reduce((sum, item) => sum + item.invoiceValue, 0) -
        (discount || sale.discount);
    }

    // Use findOneAndUpdate to avoid validation issues
    const updatedSale = await Sale.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: false,
    });

    if (!updatedSale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    // Update customer balance
    const customer = await Customer.findById(sale.customerId);
    if (customer) {
      customer.currentBalance =
        customer.currentBalance - oldAmount + sale.finalAmount;
      await customer.save();
    }

    return NextResponse.json({
      message: "Sale updated successfully",
      sale: {
        id: sale._id,
        invoiceNumber: sale.invoiceNumber,
        invoiceDate: sale.invoiceDate,
        customerId: sale.customerId,
        customerDetails: sale.customerDetails,
        items: sale.items,
        subtotal: sale.subtotal,
        totalGST: sale.totalGST,
        invoiceValue: sale.invoiceValue,
        discount: sale.discount,
        finalAmount: sale.finalAmount,
        paymentStatus: sale.paymentStatus,
        deliveryStatus: sale.deliveryStatus,
        notes: sale.notes,
        updatedAt: sale.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating sale:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
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

// DELETE /api/sales/[id] - Delete/cancel sale
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check permissions
    if (!["admin", "manager", "accountant"].includes(user.role)) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const unwrappedParams = await params;
    const { id } = unwrappedParams;

    // Find sale
    const sale = await Sale.findOne({
      _id: id,
      companyId: user.companyAccess[0],
    });

    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    // Soft delete by marking as cancelled
    sale.deliveryStatus = "Cancelled";
    await sale.save();

    // Update customer balance
    const customer = await Customer.findById(sale.customerId);
    if (customer) {
      customer.currentBalance -= sale.finalAmount;
      await customer.save();
    }

    return NextResponse.json({
      message: "Sale cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling sale:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
