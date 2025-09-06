const mongoose = require('mongoose');
require('dotenv').config();

// Import the Stock model
const Stock = require('./StockModel');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixStockCalculations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get all stocks
    const stocks = await Stock.find({});
    console.log(`Found ${stocks.length} stocks to fix`);

    for (const stock of stocks) {
      console.log(`Fixing calculations for ${stock.product} (${stock.companyId})`);
      
      // Calculate closing stock
      stock.closingStock = stock.openingStock + stock.totalPurchases - stock.totalSales;
      
      // Calculate stock given from agent allocations
      stock.stockGiven = stock.agentStocks.reduce((sum, as) => sum + as.stockAllocated, 0);
      
      // Calculate stock delivered from agent allocations
      stock.stockDelivered = stock.agentStocks.reduce((sum, as) => sum + as.stockDelivered, 0);
      
      // Calculate sales returns from agent allocations
      stock.salesReturns = stock.agentStocks.reduce((sum, as) => sum + as.stockReturned, 0);
      
      // Calculate stock available
      stock.stockAvailable = stock.stockGiven - stock.stockDelivered + stock.salesReturns;
      
      // Check for low stock and expired
      stock.isLowStock = stock.closingStock <= stock.minimumStock;
      stock.isExpired = new Date() > stock.expiryDate;
      
      await stock.save();
      
      console.log(`  Opening: ${stock.openingStock}, Purchases: ${stock.totalPurchases}, Sales: ${stock.totalSales}`);
      console.log(`  Closing: ${stock.closingStock}, Available: ${stock.stockAvailable}`);
      console.log(`  Stock Given: ${stock.stockGiven}, Stock Delivered: ${stock.stockDelivered}`);
      console.log(`  Low Stock: ${stock.isLowStock}, Expired: ${stock.isExpired}`);
      console.log('');
    }

    console.log('Stock calculations fixed successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixStockCalculations();



