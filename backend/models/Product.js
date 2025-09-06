const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: [true, "Product code is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    hsnCode: {
      type: String,
      required: [true, "HSN code is required"],
      trim: true,
      maxlength: [20, "HSN code cannot exceed 20 characters"],
    },
    gstRate: {
      type: Number,
      required: [true, "GST rate is required"],
      min: [0, "GST rate cannot be negative"],
      max: [100, "GST rate cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for faster queries
productSchema.index({ productCode: 1 });
productSchema.index({ name: 1 });
productSchema.index({ hsnCode: 1 });
productSchema.index({ createdAt: -1 }); // For pagination
productSchema.index({ name: 1, hsnCode: 1 }); // For search by name and HSN
// Compound index for search and pagination
productSchema.index({ name: "text", productCode: "text", hsnCode: "text" }); // Full-text search
productSchema.index({ createdAt: -1, name: 1 }); // For sorted pagination

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
