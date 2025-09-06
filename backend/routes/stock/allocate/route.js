const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import the Stock model from the models directory
const Stock = require('../../models/Stock');

// POST /api/stock/allocate - Allocate stock to agents
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const { stockId, allocations } = body;

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
    const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
    
    if (totalAllocation > stock.closingStock) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${stock.closingStock} ${stock.unit}, Requested: ${totalAllocation} ${stock.unit}`
      });
    }

    // Process each allocation
    const results = [];
    
    for (const allocation of allocations) {
      try {
        await stock.allocateToAgent(
          allocation.agentId,
          allocation.agentName,
          allocation.quantity
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

    // Refresh stock data
    await stock.save();

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

// GET /api/stock/allocate - Get agent stock allocations
router.get("/", async (req, res) => {
  try {
    const { stockId, agentId } = req.query;

    if (!stockId) {
      return res.status(400).json({
        message: "Stock ID is required"
      });
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({
        message: "Stock not found"
      });
    }

    let agentStocks = stock.agentStocks;

    // Filter by specific agent if provided
    if (agentId) {
      agentStocks = agentStocks.filter(as => as.agentId.toString() === agentId);
    }

    return res.json({
      stock: {
        id: stock._id,
        product: stock.product,
        companyId: stock.companyId,
        unit: stock.unit,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
      },
      agentStocks,
    });
  } catch (error) {
    console.error("Error fetching agent allocations:", error);
    return res.status(500).json({
      message: "Failed to fetch agent allocations"
    });
  }
});

module.exports = router;
