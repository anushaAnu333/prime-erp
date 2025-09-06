const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: [true, "Vendor code is required"],
      trim: true,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      maxlength: [100, "Vendor name cannot exceed 100 characters"],
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      maxlength: [50, "Contact person name cannot exceed 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    gstNumber: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter a valid GST number",
      ],
    },
    paymentTerms: {
      type: String,
      required: [true, "Payment terms are required"],
      trim: true,
      enum: ["Cash", "7 days", "15 days", "30 days", "45 days", "60 days"],
      default: "30 days",
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, "Current balance cannot be negative"],
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

// Index for efficient queries
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ vendorName: 1 });
vendorSchema.index({ vendorCode: 1 }, { unique: true });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
