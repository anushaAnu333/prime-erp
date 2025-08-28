import Stock from "../models/Stock.js";

/**
 * Update stock for a product
 * @param {string} productName - Product name
 * @param {number} qty - Quantity to update
 * @param {string} operation - 'add', 'subtract', 'set'
 * @param {string} type - 'purchase', 'return', 'sale'
 * @returns {Promise<object>} Updated stock record
 */
const updateStock = async (productName, qty, operation, type = "purchase") => {
  try {
    let stockUpdate = {};

    switch (operation) {
      case "add":
        stockUpdate = {
          $inc: {
            currentStock: qty,
            ...(type === "purchase" && { totalPurchases: qty }),
            ...(type === "return" && { totalReturns: qty }),
            ...(type === "sale" && { totalSales: qty }),
          },
        };
        break;
      case "subtract":
        stockUpdate = {
          $inc: {
            currentStock: -qty,
            ...(type === "purchase" && { totalReturns: qty }),
            ...(type === "sale" && { totalSales: qty }),
          },
        };
        break;
      case "set":
        stockUpdate = {
          $set: {
            currentStock: qty,
          },
        };
        break;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }

    stockUpdate.$set = {
      ...stockUpdate.$set,
      lastUpdated: new Date(),
    };

    const updatedStock = await Stock.findOneAndUpdate(
      { product: productName },
      stockUpdate,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return updatedStock;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};

/**
 * Get current stock for a product
 * @param {string} productName - Product name
 * @returns {Promise<object>} Stock record
 */
const getCurrentStock = async (productName) => {
  try {
    const stock = await Stock.findOne({ product: productName });
    return (
      stock || {
        product: productName,
        currentStock: 0,
        totalPurchases: 0,
        totalReturns: 0,
        totalSales: 0,
      }
    );
  } catch (error) {
    console.error("Error getting current stock:", error);
    throw error;
  }
};

/**
 * Get stock summary for all products
 * @returns {Promise<Array>} Array of stock records
 */
const getStockSummary = async () => {
  try {
    const stockSummary = await Stock.find({}).sort({
      product: 1,
    });

    return stockSummary;
  } catch (error) {
    console.error("Error getting stock summary:", error);
    throw error;
  }
};

/**
 * Update vendor balance
 * @param {string} vendorId - Vendor ID
 * @param {number} amount - Amount to update
 * @param {string} operation - 'increase' or 'decrease'
 * @returns {Promise<object>} Updated vendor
 */
const updateVendorBalance = async (vendorId, amount, operation) => {
  try {
    const { default: Vendor } = await import("../models/Vendor.js");

    const balanceUpdate =
      operation === "increase"
        ? { $inc: { currentBalance: amount } }
        : { $inc: { currentBalance: -amount } };

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      balanceUpdate,
      { new: true }
    );

    return updatedVendor;
  } catch (error) {
    console.error("Error updating vendor balance:", error);
    throw error;
  }
};

/**
 * Check if stock is sufficient for sale
 * @param {string} productName - Product name
 * @param {number} qty - Quantity needed
 * @returns {Promise<boolean>} True if sufficient stock
 */
const checkStockAvailability = async (productName, qty) => {
  try {
    const stock = await getCurrentStock(productName);
    return stock.currentStock >= qty;
  } catch (error) {
    console.error("Error checking stock availability:", error);
    throw error;
  }
};

/**
 * Get low stock products (below threshold)
 * @param {number} threshold - Stock threshold (default 10)
 * @returns {Promise<Array>} Array of low stock products
 */
const getLowStockProducts = async (threshold = 10) => {
  try {
    const lowStock = await Stock.find({
      currentStock: { $lt: threshold },
    }).sort({ currentStock: 1 });

    return lowStock;
  } catch (error) {
    console.error("Error getting low stock products:", error);
    throw error;
  }
};

/**
 * Initialize stock for all products
 * @returns {Promise<Array>} Array of initialized stock records
 */
const initializeStock = async () => {
  try {
    const products = [
      "dosa",
      "idli",
      "chapati",
      "parata",
      "paneer",
      "green peas",
    ];
    const stockRecords = [];

    for (const product of products) {
      const stock = await Stock.findOneAndUpdate(
        { product: product },
        {
          $setOnInsert: {
            product: product,
            currentStock: 0,
            totalPurchases: 0,
            totalReturns: 0,
            totalSales: 0,
            lastUpdated: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      stockRecords.push(stock);
    }

    return stockRecords;
  } catch (error) {
    console.error("Error initializing stock:", error);
    throw error;
  }
};

export {
  updateStock,
  getCurrentStock,
  getStockSummary,
  updateVendorBalance,
  checkStockAvailability,
  getLowStockProducts,
  initializeStock,
};
