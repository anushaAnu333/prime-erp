const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: [true, "Product is required"],
    // Removed enum to allow dynamic products from database
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"],
  },
  qty: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
  },
  rate: {
    type: Number,
    required: [true, "Rate is required"],
    min: [0, "Rate cannot be negative"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
    enum: ["kg", "packet", "packets", "piece", "pieces", "dozen", "box", "boxes", "l", "liters"],
  },
  hsnCode: {
    type: String,
    required: [true, "HSN Code is required"],
  },
  taxableValue: {
    type: Number,
    required: [true, "Taxable value is required"],
    min: [0, "Taxable value cannot be negative"],
  },
  gst: {
    type: Number,
    required: [true, "GST amount is required"],
    min: [0, "GST cannot be negative"],
  },
  invoiceValue: {
    type: Number,
    required: [true, "Invoice value is required"],
    min: [0, "Invoice value cannot be negative"],
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: [true, "Purchase number is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Purchase date is required"],
      default: Date.now,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    vendorDetails: {
      name: {
        type: String,
        required: [true, "Vendor name is required"],
      },
      address: {
        type: String,
        required: [true, "Vendor address is required"],
      },
      phone: {
        type: String,
        required: [true, "Vendor phone is required"],
      },
      gstNumber: {
        type: String,
        required: [true, "Vendor GST number is required"],
      },
    },
    supplierInvoiceNumber: {
      type: String,
      required: false,
      trim: true,
    },
    supplierInvoiceDate: {
      type: Date,
      required: false,
    },
    items: [purchaseItemSchema],
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total cannot be negative"],
    },
    purchaseType: {
      type: String,
      required: [true, "Purchase type is required"],
      enum: ["Purchase", "Purchase Return"],
      default: "Purchase",
    },
    againstPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      // Only required for purchase returns
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["Pending", "Received", "Cancelled", "Returned"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online"],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for now, will be required when auth is implemented
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
purchaseSchema.index({ purchaseType: 1 });
purchaseSchema.index({ vendorName: 1 });
purchaseSchema.index({ date: -1 });
purchaseSchema.index({ purchaseNumber: 1 }, { unique: true });
purchaseSchema.index({ status: 1 });

const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
