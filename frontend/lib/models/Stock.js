import mongoose from 'mongoose';

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
      type: String, // Invoice number, agent name, etc.
      required: true,
    },
    referenceId: {
      type: String,
    },
    referenceModel: {
      type: String,
      enum: ["Purchase", "Sale", "User"], // For agent allocations
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
    type: String,
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
      // Removed enum to allow dynamic products from purchases/sales
    },

    // Stock Formula Components
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

    // Agent Stock Allocation
    agentStocks: [agentStockSchema],

    // Stock Flow Components
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

    // Product Details
    unit: {
      type: String,
      required: true,
      enum: ["packets", "packs", "kg"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },

    // Alerts and Settings
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

    // Stock Movements History
    movements: [stockMovementSchema],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
stockSchema.index({ product: 1 }, { unique: true });
stockSchema.index({ product: 1 });
stockSchema.index({ isLowStock: 1 });
stockSchema.index({ isExpired: 1 });
stockSchema.index({ expiryDate: 1 });

// Pre-save middleware to calculate closing stock
stockSchema.pre("save", function (next) {
  // Calculate closing stock using the formula
  this.closingStock = this.openingStock + this.totalPurchases - this.totalSales;

  // Calculate stock available (what's left in main warehouse after giving to agents)
  this.stockAvailable = this.closingStock - this.stockGiven;

  // Check for low stock
  this.isLowStock = this.closingStock <= this.minimumStock;

  // Check for expired stock
  this.isExpired = new Date() > this.expiryDate;

  next();
});

// Method to add stock movement
stockSchema.methods.addMovement = function (movement) {
  this.movements.push(movement);

  // Update totals based on movement type
  switch (movement.type) {
    case "purchase":
      this.totalPurchases += movement.quantity;
      break;
    case "sale":
      this.totalSales += movement.quantity;
      break;
    case "purchase_return":
      this.totalPurchases -= movement.quantity;
      break;
    case "sale_return":
      this.totalSales -= movement.quantity;
      break;
    case "agent_allocation":
      this.stockGiven += movement.quantity;
      break;
    case "agent_return":
      this.stockGiven -= movement.quantity;
      break;
  }

  // Recalculate closing stock
  this.closingStock = this.openingStock + this.totalPurchases - this.totalSales;
  this.stockAvailable = this.closingStock - this.stockGiven;

  // Don't save here - let the calling method handle the save
  return this;
};

// Method to allocate stock to agent
stockSchema.methods.allocateToAgent = function (agentId, agentName, quantity) {
  if (quantity > this.closingStock) {
    throw new Error("Insufficient stock for allocation");
  }

  // Find or create agent stock entry
  let agentStock = this.agentStocks.find(
    (as) => as.agentId === agentId
  );

  if (!agentStock) {
    agentStock = {
      agentId,
      agentName,
      stockAllocated: 0,
      stockDelivered: 0,
      stockReturned: 0,
      stockInHand: 0,
    };
    this.agentStocks.push(agentStock);
  }

  // Update agent stock
  agentStock.stockAllocated += quantity;
  agentStock.stockInHand += quantity;
  agentStock.lastUpdated = new Date();

  // Update overall stock
  this.stockGiven += quantity;
  this.stockAvailable = this.closingStock - this.stockGiven;

  // Add movement record
  this.addMovement({
    type: "agent_allocation",
    quantity,
    reference: agentName,
    referenceId: agentId,
    notes: `Allocated ${quantity} ${this.unit} to ${agentName}`,
  });

  // Save the document once after all modifications
  return this.save();
};

// Method to update agent delivery
stockSchema.methods.updateAgentDelivery = function (
  agentId,
  deliveredQuantity
) {
  const agentStock = this.agentStocks.find(
    (as) => as.agentId === agentId
  );

  if (!agentStock) {
    throw new Error("Agent not found in stock allocation");
  }

  if (deliveredQuantity > agentStock.stockInHand) {
    throw new Error("Cannot deliver more than stock in hand");
  }

  // Update agent stock
  agentStock.stockDelivered += deliveredQuantity;
  agentStock.stockInHand -= deliveredQuantity;
  agentStock.lastUpdated = new Date();

  // Update overall stock
  this.stockDelivered += deliveredQuantity;
  this.stockAvailable = this.closingStock - this.stockGiven;

  return this.save();
};

// Method to handle sales return
stockSchema.methods.handleSalesReturn = function (agentId, returnQuantity) {
  const agentStock = this.agentStocks.find(
    (as) => as.agentId === agentId
  );

  if (!agentStock) {
    throw new Error("Agent not found in stock allocation");
  }

  // Update agent stock
  agentStock.stockReturned += returnQuantity;
  agentStock.stockInHand += returnQuantity;
  agentStock.lastUpdated = new Date();

  // Update overall stock
  this.salesReturns += returnQuantity;
  this.stockAvailable = this.closingStock - this.stockGiven;

  // Add movement record
  this.addMovement({
    type: "sale_return",
    quantity: returnQuantity,
    reference: `Return from ${agentStock.agentName}`,
    notes: `Sales return of ${returnQuantity} ${this.unit}`,
  });

  return this.save();
};

const Stock = mongoose.models.Stock || mongoose.model("Stock", stockSchema);

export default Stock;