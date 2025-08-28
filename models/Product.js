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
productSchema.index({ name: 1 });
productSchema.index({ productCode: 1 });
productSchema.index({ hsnCode: 1 });
productSchema.index({ createdAt: -1 }); // For pagination
productSchema.index({ name: 1, hsnCode: 1 }); // For search by name and HSN

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
