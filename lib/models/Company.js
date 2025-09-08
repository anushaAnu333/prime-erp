import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyCode: {
      type: String,
      required: [true, "Company code is required"],
      unique: true,
      trim: true,
      enum: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
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
companySchema.index({ companyCode: 1 });
companySchema.index({ isActive: 1 });

const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;


