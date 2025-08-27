const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      enum: ["dosa", "idli", "chapati", "parata", "paneer", "green peas"],
    },
    companyId: {
      type: String,
      required: [true, "Company ID is required"],
      enum: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, "Current stock cannot be negative"],
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: [0, "Total purchases cannot be negative"],
    },
    totalReturns: {
      type: Number,
      default: 0,
      min: [0, "Total returns cannot be negative"],
    },
    totalSales: {
      type: Number,
      default: 0,
      min: [0, "Total sales cannot be negative"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique product-company combination
stockSchema.index({ productName: 1, companyId: 1 }, { unique: true });
stockSchema.index({ companyId: 1 });
stockSchema.index({ currentStock: 1 });

const Stock =
  mongoose.models.Stock || mongoose.model("Stock", stockSchema);

module.exports = Stock;
