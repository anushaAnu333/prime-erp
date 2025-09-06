const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "purchase",
        "sale",
        "purchase_return",
        "sale_return",
        "agent_allocation",
        "agent_return",
        "manual_adjustment",
      ],
    },
    quantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["Purchase", "Sale", "User"],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const agentStockSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  stockAllocated: {
    type: Number,
    default: 0,
    min: 0,
  },
  stockDelivered: {
    type: Number,
    default: 0,
    min: 0,
  },
  stockReturned: {
    type: Number,
    default: 0,
    min: 0,
  },
  stockInHand: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: [true, "Product is required"],
      enum: [
        "dosa",
        "idli",
        "chapati",
        "parata",
        "paneer",
        "green peas",
        "Dosa",
        "Idli",
        "Chapati",
        "Parata",
        "Paneer",
        "Green peas",
        "Rice (Basmati)",
        "Wheat Flour",
        "Cooking Oil",
        "Sugar",
        "Salt",
        "Milk Powder",
      ],
    },
    companyId: {
      type: String,
      required: true,
    },
    openingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    closingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    agentStocks: [agentStockSchema],
    stockGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockDelivered: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesReturns: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["packets", "packs", "kg"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    movements: [stockMovementSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate closing stock
stockSchema.pre("save", function (next) {
  this.closingStock = this.openingStock + this.totalPurchases - this.totalSales;
  this.stockAvailable = this.stockGiven - this.stockDelivered + this.salesReturns;
  this.isLowStock = this.closingStock <= this.minimumStock;
  this.isExpired = new Date() > this.expiryDate;
  next();
});

const Stock = mongoose.models.Stock || mongoose.model("Stock", stockSchema);

module.exports = Stock;
