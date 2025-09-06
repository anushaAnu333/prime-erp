const mongoose = require('mongoose');
require('dotenv').config();

// Import the Stock model
const Stock = require('./StockModel');

const MONGODB_URI = process.env.MONGODB_URI;

async function addNewStock() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing stocks first
    await Stock.deleteMany({});
    console.log('Cleared existing stock data');

    // Add new stock data with valid products and agent allocations
    const newStocks = [
      {
        product: 'dosa',
        companyId: 'PRIMA-SM',
        openingStock: 100,
        totalPurchases: 50,
        totalSales: 30,
        unit: 'packets',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        minimumStock: 20,
        agentStocks: [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Rajesh Kumar',
            stockAllocated: 25,
            stockDelivered: 15,
            stockReturned: 2,
            stockInHand: 12,
            lastUpdated: new Date()
          },
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Suresh Singh',
            stockAllocated: 20,
            stockDelivered: 10,
            stockReturned: 1,
            stockInHand: 11,
            lastUpdated: new Date()
          }
        ]
      },
      {
        product: 'idli',
        companyId: 'PRIMA-FT',
        openingStock: 80,
        totalPurchases: 40,
        totalSales: 25,
        unit: 'packets',
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        minimumStock: 15,
        agentStocks: [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Amit Sharma',
            stockAllocated: 20,
            stockDelivered: 12,
            stockReturned: 1,
            stockInHand: 9,
            lastUpdated: new Date()
          }
        ]
      },
      {
        product: 'chapati',
        companyId: 'PRIMA-EX',
        openingStock: 60,
        totalPurchases: 30,
        totalSales: 20,
        unit: 'packets',
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        minimumStock: 10,
        agentStocks: [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Vikram Patel',
            stockAllocated: 15,
            stockDelivered: 8,
            stockReturned: 0,
            stockInHand: 7,
            lastUpdated: new Date()
          }
        ]
      },
      {
        product: 'paneer',
        companyId: 'PRIMA-SM',
        openingStock: 40,
        totalPurchases: 20,
        totalSales: 15,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        minimumStock: 5,
        agentStocks: [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Rajesh Kumar',
            stockAllocated: 10,
            stockDelivered: 5,
            stockReturned: 1,
            stockInHand: 6,
            lastUpdated: new Date()
          }
        ]
      },
      {
        product: 'green peas',
        companyId: 'PRIMA-FT',
        openingStock: 30,
        totalPurchases: 15,
        totalSales: 10,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        minimumStock: 5,
        agentStocks: [
          {
            agentId: new mongoose.Types.ObjectId(),
            agentName: 'Suresh Singh',
            stockAllocated: 8,
            stockDelivered: 3,
            stockReturned: 0,
            stockInHand: 5,
            lastUpdated: new Date()
          }
        ]
      }
    ];

    // Insert new stocks
    const insertedStocks = await Stock.insertMany(newStocks);
    console.log(`Successfully inserted ${insertedStocks.length} stock records`);

    // Display the inserted data
    console.log('\nNew Stock Data:');
    insertedStocks.forEach((stock, index) => {
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
addNewStock();



