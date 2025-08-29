const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  product: {
    type: String,
    required: [true, "Product is required"],
    enum: ["dosa", "idli", "chapati", "parata", "paneer", "green peas"],
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"],
  },
  qty: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0.01, "Quantity must be greater than 0"],
  },
  rate: {
    type: Number,
    required: [true, "Rate is required"],
    min: [0, "Rate cannot be negative"],
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
  gstRate: {
    type: Number,
    required: [true, "GST rate is required"],
  },
  hsnCode: {
    type: String,
    required: [true, "HSN Code is required"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Invoice date is required"],
      default: Date.now,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerAddress: {
      type: String,
      required: [true, "Customer address is required"],
      trim: true,
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    items: [saleItemSchema],
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
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryAgent: {
      type: String,
      required: [true, "Delivery agent is required"],
      trim: true,
    },
    companyId: {
      type: String,
      required: [true, "Company ID is required"],
      enum: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
    payments: [
      {
        paymentMode: {
          type: String,
          enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
          required: true,
        },
        amountPaid: {
          type: Number,
          min: [0, "Amount paid cannot be negative"],
          required: true,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
        referenceNumber: {
          type: String,
          trim: true,
          default: "",
        },
        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["Sale", "Sale Return"],
      default: "Sale",
    },
    originalSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
saleSchema.index({ companyId: 1 });
saleSchema.index({ deliveryAgent: 1 });
saleSchema.index({ date: -1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerName: 1 });
saleSchema.index({ customerId: 1 });

const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);

module.exports = Sale;
