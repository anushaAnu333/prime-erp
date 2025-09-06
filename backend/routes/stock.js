const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import the Stock model from the models directory
const Stock = require('../models/Stock');

// Import allocate routes
// const allocateRoutes = require('./allocate/route');

// Delivery Guy Stock Model
const DeliveryStockSchema = new mongoose.Schema({
  deliveryGuyId: { type: String, required: true },
  deliveryGuyName: { type: String, required: true },
  product: { type: String, required: true },
  unit: { type: String, required: true },
  openingStock: { type: Number, default: 0 },
  stockReceived: { type: Number, default: 0 },
  stockDelivered: { type: Number, default: 0 },
  stockReturned: { type: Number, default: 0 },
  closingStock: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
});

const DeliveryStock = mongoose.model("DeliveryStock", DeliveryStockSchema);

// Get all stock data
router.get("/", async (req, res) => {
  try {
    const { lowStock, expired } = req.query;
    
    let query = {};
    if (lowStock === 'true') query.isLowStock = true;
    if (expired === 'true') query.isExpired = true;

    const stocks = await Stock.find(query).sort({ product: 1 });
    
    // Calculate summary
    const summary = {
      totalProducts: stocks.length,
      totalOpeningStock: stocks.reduce((sum, stock) => sum + stock.openingStock, 0),
      totalPurchases: stocks.reduce((sum, stock) => sum + stock.totalPurchases, 0),
      totalSales: stocks.reduce((sum, stock) => sum + stock.totalSales, 0),
      totalClosingStock: stocks.reduce((sum, stock) => sum + stock.closingStock, 0),
      totalStockGiven: stocks.reduce((sum, stock) => sum + stock.stockGiven, 0),
      totalStockDelivered: stocks.reduce((sum, stock) => sum + stock.stockDelivered, 0),
      totalStockAvailable: stocks.reduce((sum, stock) => sum + stock.stockAvailable, 0),
      lowStockCount: stocks.filter(stock => stock.isLowStock).length,
      expiredCount: stocks.filter(stock => stock.isExpired).length
    };

    res.json({
      success: true,
      stocks,
      summary
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ message: "Failed to fetch stock data" });
  }
});

// Get delivery guys stock data - redirect to new endpoint
router.get("/delivery", async (req, res) => {
  res.json({ message: "Stock detail route" });
});

// New delivery stock endpoint
router.get("/delivery-stock", async (req, res) => {
  try {
    const { deliveryGuyId, status, date } = req.query;

    // Build query for stocks with agent allocations
    let query = { 
      isActive: true,
      "agentStocks.0": { $exists: true } // Only stocks that have agent allocations
    };

    // Get all stocks with agent allocations
    const stocks = await Stock.find(query)
      .sort({ product: 1 })
      .lean();

    // Transform data to delivery stock format
    const deliveryStocks = [];
    const deliveryGuyMap = new Map();

    stocks.forEach(stock => {
      stock.agentStocks.forEach(agentStock => {
        // Apply filters
        if (deliveryGuyId && agentStock.agentId.toString() !== deliveryGuyId) {
          return;
        }

        if (status && status !== "All Status") {
          // For now, we'll consider all as "Active" since we don't have status field
          if (status === "Completed") return;
        }

        if (date) {
          const stockDate = new Date(agentStock.lastUpdated);
          const filterDate = new Date(date);
          if (stockDate.toDateString() !== filterDate.toDateString()) {
            return;
          }
        }

        const deliveryStock = {
          _id: `${stock._id}_${agentStock.agentId}`,
          deliveryGuyId: agentStock.agentId,
          deliveryGuyName: agentStock.agentName,
          product: stock.product,
          unit: stock.unit,
          openingStock: agentStock.stockAllocated,
          stockReceived: agentStock.stockAllocated,
          stockDelivered: agentStock.stockDelivered,
          stockReturned: agentStock.stockReturned,
          closingStock: agentStock.stockInHand,
          date: agentStock.lastUpdated,
          status: agentStock.stockInHand > 0 ? "Active" : "Completed"
        };

        deliveryStocks.push(deliveryStock);

        // Track delivery guys for summary
        if (!deliveryGuyMap.has(agentStock.agentId)) {
          deliveryGuyMap.set(agentStock.agentId, {
            id: agentStock.agentId,
            name: agentStock.agentName,
            totalStockReceived: 0,
            totalStockDelivered: 0,
            totalStockReturned: 0,
            totalClosingStock: 0
          });
        }

        const deliveryGuy = deliveryGuyMap.get(agentStock.agentId);
        deliveryGuy.totalStockReceived += agentStock.stockAllocated;
        deliveryGuy.totalStockDelivered += agentStock.stockDelivered;
        deliveryGuy.totalStockReturned += agentStock.stockReturned;
        deliveryGuy.totalClosingStock += agentStock.stockInHand;
      });
    });

    // Calculate summary
    const summary = {
      totalDeliveryGuys: deliveryGuyMap.size,
      totalStockReceived: deliveryStocks.reduce((sum, ds) => sum + ds.stockReceived, 0),
      totalStockDelivered: deliveryStocks.reduce((sum, ds) => sum + ds.stockDelivered, 0),
      totalStockReturned: deliveryStocks.reduce((sum, ds) => sum + ds.stockReturned, 0),
      totalClosingStock: deliveryStocks.reduce((sum, ds) => sum + ds.closingStock, 0),
    };

    res.json({
      deliveryStocks,
      summary,
    });
  } catch (error) {
    console.error("Error fetching delivery stock data:", error);
    res.status(500).json(
      { message: "Failed to fetch delivery stock data" }
    );
  }
});

// Create new stock entry
router.post("/", async (req, res) => {
  try {
    const stockData = {
      ...req.body,
      closingStock: (req.body.openingStock || 0) + (req.body.totalPurchases || 0) - (req.body.totalSales || 0),
      stockAvailable: (req.body.openingStock || 0) + (req.body.totalPurchases || 0) - (req.body.totalSales || 0) - (req.body.stockGiven || 0),
      isLowStock: (req.body.openingStock || 0) < (req.body.minStockLevel || 10),
      isExpired: req.body.expiryDate ? new Date(req.body.expiryDate) < new Date() : false,
      lastUpdated: new Date()
    };

    const stock = new Stock(stockData);
    await stock.save();

    res.json({
      success: true,
      stock,
      message: "Stock entry created successfully"
    });
  } catch (error) {
    console.error("Error creating stock entry:", error);
    res.status(500).json({ message: "Failed to create stock entry" });
  }
});

// Create delivery guy stock entry
router.post("/delivery", async (req, res) => {
  try {
    const deliveryStockData = {
      ...req.body,
      closingStock: (req.body.openingStock || 0) + (req.body.stockReceived || 0) - (req.body.stockDelivered || 0) - (req.body.stockReturned || 0),
      date: new Date()
    };

    const deliveryStock = new DeliveryStock(deliveryStockData);
    await deliveryStock.save();

    res.json({
      success: true,
      deliveryStock,
      message: "Delivery stock entry created successfully"
    });
  } catch (error) {
    console.error("Error creating delivery stock entry:", error);
    res.status(500).json({ message: "Failed to create delivery stock entry" });
  }
});

// Update stock entry
router.put("/:id", async (req, res) => {
  try {
    const stockData = {
      ...req.body,
      closingStock: (req.body.openingStock || 0) + (req.body.totalPurchases || 0) - (req.body.totalSales || 0),
      stockAvailable: (req.body.openingStock || 0) + (req.body.totalPurchases || 0) - (req.body.totalSales || 0) - (req.body.stockGiven || 0),
      isLowStock: (req.body.openingStock || 0) < (req.body.minStockLevel || 10),
      isExpired: req.body.expiryDate ? new Date(req.body.expiryDate) < new Date() : false,
      lastUpdated: new Date()
    };

    const stock = await Stock.findByIdAndUpdate(req.params.id, stockData, { new: true });
    
    if (!stock) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.json({
      success: true,
      stock,
      message: "Stock entry updated successfully"
    });
  } catch (error) {
    console.error("Error updating stock entry:", error);
    res.status(500).json({ message: "Failed to update stock entry" });
  }
});

// Update delivery stock entry
router.put("/delivery/:id", async (req, res) => {
  try {
    const deliveryStockData = {
      ...req.body,
      closingStock: (req.body.openingStock || 0) + (req.body.stockReceived || 0) - (req.body.stockDelivered || 0) - (req.body.stockReturned || 0)
    };

    const deliveryStock = await DeliveryStock.findByIdAndUpdate(req.params.id, deliveryStockData, { new: true });
    
    if (!deliveryStock) {
      return res.status(404).json({ message: "Delivery stock entry not found" });
    }

    res.json({
      success: true,
      deliveryStock,
      message: "Delivery stock entry updated successfully"
    });
  } catch (error) {
    console.error("Error updating delivery stock entry:", error);
    res.status(500).json({ message: "Failed to update delivery stock entry" });
  }
});

// Delete stock entry
router.delete("/:id", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.json({
      success: true,
      message: "Stock entry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting stock entry:", error);
    res.status(500).json({ message: "Failed to delete stock entry" });
  }
});

// Delete delivery stock entry
router.delete("/delivery/:id", async (req, res) => {
  try {
    const deliveryStock = await DeliveryStock.findByIdAndDelete(req.params.id);
    
    if (!deliveryStock) {
      return res.status(404).json({ message: "Delivery stock entry not found" });
    }

    res.json({
      success: true,
      message: "Delivery stock entry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting delivery stock entry:", error);
    res.status(500).json({ message: "Failed to delete delivery stock entry" });
  }
});

// Get stock by ID
router.get("/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.json({
      success: true,
      stock
    });
  } catch (error) {
    console.error("Error fetching stock entry:", error);
    res.status(500).json({ message: "Failed to fetch stock entry" });
  }
});

// Get delivery stock by ID
router.get("/delivery/:id", async (req, res) => {
  try {
    const deliveryStock = await DeliveryStock.findById(req.params.id);
    
    if (!deliveryStock) {
      return res.status(404).json({ message: "Delivery stock entry not found" });
    }

    res.json({
      success: true,
      deliveryStock
    });
  } catch (error) {
    console.error("Error fetching delivery stock entry:", error);
    res.status(500).json({ message: "Failed to fetch delivery stock entry" });
  }
});

// Complete delivery - new endpoint
router.put("/delivery-stock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    // Parse the composite ID (stockId_agentId)
    const [stockId, agentId] = id.split('_');
    
    if (!stockId || !agentId) {
      return res.status(400).json(
        { message: "Invalid delivery ID format" }
      );
    }

    const stock = await Stock.findById(stockId);
    
    if (!stock) {
      return res.status(404).json(
        { message: "Stock not found" }
      );
    }

    const agentStock = stock.agentStocks.find(
      as => as.agentId === agentId
    );

    if (!agentStock) {
      return res.status(404).json(
        { message: "Agent stock allocation not found" }
      );
    }

    // Mark all remaining stock as delivered (complete the delivery)
    const remainingStock = agentStock.stockInHand;
    
    if (remainingStock > 0) {
      agentStock.stockDelivered += remainingStock;
      agentStock.stockInHand = 0;
      agentStock.lastUpdated = new Date();
      
      // Update overall stock
      stock.stockDelivered += remainingStock;
      stock.stockAvailable = stock.stockGiven - stock.stockDelivered + stock.salesReturns;
      
      await stock.save();
    }

    res.json({
      message: "Delivery completed successfully",
      stock: {
        id: stock._id,
        product: stock.product,
        stockDelivered: stock.stockDelivered,
        stockAvailable: stock.stockAvailable,
      },
      agentStock: {
        agentId: agentStock.agentId,
        agentName: agentStock.agentName,
        stockDelivered: agentStock.stockDelivered,
        stockInHand: agentStock.stockInHand,
        lastUpdated: agentStock.lastUpdated,
      }
    });
  } catch (error) {
    console.error("Error completing delivery:", error);
    res.status(500).json(
      { message: "Failed to complete delivery" }
    );
  }
});

// Stock allocation route
router.post("/allocate", async (req, res) => {
  try {
    const { stockId, allocations } = req.body;

    if (!stockId || !allocations || !Array.isArray(allocations)) {
      return res.status(400).json({
        message: "Stock ID and allocations array are required"
      });
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({
        message: "Stock not found"
      });
    }

    // Validate total allocation doesn't exceed available stock
    const totalAllocation = allocations.reduce((sum, alloc) => sum + parseFloat(alloc.quantity || 0), 0);
    
    if (totalAllocation > stock.stockAvailable) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${stock.stockAvailable} ${stock.unit}, Requested: ${totalAllocation} ${stock.unit}`
      });
    }

    // Process each allocation
    const results = [];
    
    for (const allocation of allocations) {
      try {
        await stock.allocateToAgent(
          allocation.agentId,
          allocation.agentName,
          parseFloat(allocation.quantity || 0)
        );
        
        results.push({
          agentId: allocation.agentId,
          agentName: allocation.agentName,
          quantity: allocation.quantity,
          status: "success",
        });
      } catch (error) {
        results.push({
          agentId: allocation.agentId,
          agentName: allocation.agentName,
          quantity: allocation.quantity,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Stock is already saved by each allocateToAgent call
    // No need to save again

    return res.json({
      message: "Stock allocation completed",
      results,
      stock: {
        id: stock._id,
        product: stock.product,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
      },
    });
  } catch (error) {
    console.error("Error allocating stock:", error);
    return res.status(500).json({
      message: "Failed to allocate stock"
    });
  }
});

module.exports = router;
