import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
      required: [true, "Payment mode is required"],
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
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
    companyId: {
      type: String,
      required: [true, "Company ID is required"],
      enum: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    },
    relatedSaleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    ],
    type: {
      type: String,
      enum: ["Payment Received", "Payment Refund"],
      default: "Payment Received",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
paymentSchema.index({ customerId: 1, paymentDate: -1 });
paymentSchema.index({ companyId: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
