import mongoose from "mongoose";

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
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"],
    },
    gstRate: {
      type: Number,
      required: [true, "GST rate is required"],
      min: [0, "GST rate cannot be negative"],
      max: [100, "GST rate cannot exceed 100%"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      maxlength: [20, "Unit cannot exceed 20 characters"],
    },
    companyId: {
      type: String,
      required: [true, "Company ID is required"],
      trim: true,
      maxlength: [20, "Company ID cannot exceed 20 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for faster queries
productSchema.index({ companyId: 1, isActive: 1 });
productSchema.index({ name: 1 });
productSchema.index({ productCode: 1 });
productSchema.index({ isActive: 1, createdAt: -1 }); // For pagination
productSchema.index({ companyId: 1, name: 1 }); // For company + search
productSchema.index({ companyId: 1, productCode: 1 }); // For company + code search

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
