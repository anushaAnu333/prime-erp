const mongoose = require('mongoose');
require('dotenv').config();

// Import the Stock model
const Stock = require('./StockModel');

const MONGODB_URI = process.env.MONGODB_URI;

async function addAgentStock() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get existing stocks
    const stocks = await Stock.find({});
    console.log(`Found ${stocks.length} stocks`);

    if (stocks.length === 0) {
      console.log('No stocks found. Please add stocks first.');
      return;
    }

    // Add agent stock allocations to existing stocks
    for (const stock of stocks) {
      if (stock.agentStocks.length === 0) {
        console.log(`Adding agent stock to ${stock.product} (${stock.companyId})`);
        
        // Create some sample agent allocations
        const agentStocks = [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Rajesh Kumar',
            stockAllocated: Math.floor(stock.closingStock * 0.3),
            stockDelivered: Math.floor(stock.closingStock * 0.2),
            stockReturned: Math.floor(stock.closingStock * 0.05),
            stockInHand: Math.floor(stock.closingStock * 0.15),
            lastUpdated: new Date()
          },
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Suresh Singh',
            stockAllocated: Math.floor(stock.closingStock * 0.25),
            stockDelivered: Math.floor(stock.closingStock * 0.15),
            stockReturned: Math.floor(stock.closingStock * 0.03),
            stockInHand: Math.floor(stock.closingStock * 0.13),
            lastUpdated: new Date()
          }
        ];

        // Update stock with agent allocations
        stock.agentStocks = agentStocks;
        
        // Update stock given and delivered totals
        stock.stockGiven = agentStocks.reduce((sum, as) => sum + as.stockAllocated, 0);
        stock.stockDelivered = agentStocks.reduce((sum, as) => sum + as.stockDelivered, 0);
        stock.salesReturns = agentStocks.reduce((sum, as) => sum + as.stockReturned, 0);
        
        await stock.save();
        console.log(`Updated ${stock.product} with agent allocations`);
      } else {
        console.log(`${stock.product} already has agent allocations`);
      }
    }

    // Display updated data
    console.log('\nUpdated Stock Data:');
    const updatedStocks = await Stock.find({});
    updatedStocks.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.product} (${stock.companyId})`);
      console.log(`   Opening: ${stock.openingStock}, Purchases: ${stock.totalPurchases}, Sales: ${stock.totalSales}`);
      console.log(`   Closing: ${stock.closingStock}, Available: ${stock.stockAvailable}`);
      console.log(`   Stock Given: ${stock.stockGiven}, Stock Delivered: ${stock.stockDelivered}`);
      console.log(`   Agents: ${stock.agentStocks.length}`);
      stock.agentStocks.forEach((agent, i) => {
        console.log(`     ${i + 1}. ${agent.agentName}: Allocated ${agent.stockAllocated}, Delivered ${agent.stockDelivered}, In Hand ${agent.stockInHand}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
addAgentStock();



