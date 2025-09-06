const mongoose = require('mongoose');
require('dotenv').config();

// Stock Model
const StockSchema = new mongoose.Schema({
  product: { type: String, required: true },
  companyId: { type: String, required: true },
  unit: { type: String, required: true },
  openingStock: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  closingStock: { type: Number, default: 0 },
  stockGiven: { type: Number, default: 0 },
  stockDelivered: { type: Number, default: 0 },
  salesReturns: { type: Number, default: 0 },
  stockAvailable: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
  expiryDate: { type: Date },
  isLowStock: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', StockSchema);

// Delivery Stock Model
const DeliveryStockSchema = new mongoose.Schema({
  deliveryGuyId: { type: String, required: true },
  deliveryGuyName: { type: String, required: true },
  product: { type: String, required: true },
  companyId: { type: String, required: true },
  unit: { type: String, required: true },
  openingStock: { type: Number, default: 0 },
  stockReceived: { type: Number, default: 0 },
  stockDelivered: { type: Number, default: 0 },
  stockReturned: { type: Number, default: 0 },
  closingStock: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
});

const DeliveryStock = mongoose.model('DeliveryStock', DeliveryStockSchema);

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Stock.deleteMany({});
    await DeliveryStock.deleteMany({});
    console.log('Cleared existing stock data');

    // Add sample main inventory data
    const mainStockData = [
      {
        product: 'Rice (Basmati)',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 100,
        totalPurchases: 200,
        totalSales: 150,
        stockGiven: 50,
        stockDelivered: 30,
        salesReturns: 5,
        minimumStock: 20,
        expiryDate: new Date('2024-12-31'),
        isLowStock: false,
        isExpired: false
      },
      {
        product: 'Wheat Flour',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 80,
        totalPurchases: 150,
        totalSales: 120,
        stockGiven: 40,
        stockDelivered: 25,
        salesReturns: 3,
        minimumStock: 15,
        expiryDate: new Date('2024-11-30'),
        isLowStock: false,
        isExpired: false
      },
      {
        product: 'Cooking Oil',
        companyId: 'PRIMA-FT',
        unit: 'l',
        openingStock: 50,
        totalPurchases: 100,
        totalSales: 80,
        stockGiven: 30,
        stockDelivered: 20,
        salesReturns: 2,
        minimumStock: 10,
        expiryDate: new Date('2025-01-15'),
        isLowStock: false,
        isExpired: false
      },
      {
        product: 'Sugar',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 60,
        totalPurchases: 80,
        totalSales: 70,
        stockGiven: 25,
        stockDelivered: 15,
        salesReturns: 1,
        minimumStock: 12,
        expiryDate: new Date('2025-06-30'),
        isLowStock: false,
        isExpired: false
      },
      {
        product: 'Salt',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 30,
        totalPurchases: 40,
        totalSales: 35,
        stockGiven: 15,
        stockDelivered: 10,
        salesReturns: 0,
        minimumStock: 8,
        expiryDate: new Date('2026-12-31'),
        isLowStock: true,
        isExpired: false
      },
      {
        product: 'Milk Powder',
        companyId: 'PRIMA-FT',
        unit: 'kg',
        openingStock: 25,
        totalPurchases: 50,
        totalSales: 45,
        stockGiven: 20,
        stockDelivered: 12,
        salesReturns: 1,
        minimumStock: 10,
        expiryDate: new Date('2024-10-15'),
        isLowStock: true,
        isExpired: true
      }
    ];

    // Calculate closing stock and stock available for main inventory
    const processedMainStock = mainStockData.map(stock => ({
      ...stock,
      closingStock: stock.openingStock + stock.totalPurchases - stock.totalSales,
      stockAvailable: (stock.openingStock + stock.totalPurchases - stock.totalSales) - stock.stockGiven,
      lastUpdated: new Date()
    }));

    await Stock.insertMany(processedMainStock);
    console.log('Added main inventory data');

    // Add sample delivery guys stock data
    const deliveryStockData = [
      {
        deliveryGuyId: 'DG001',
        deliveryGuyName: 'Rajesh Kumar',
        product: 'Rice (Basmati)',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 20,
        stockReceived: 30,
        stockDelivered: 25,
        stockReturned: 2,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG001',
        deliveryGuyName: 'Rajesh Kumar',
        product: 'Wheat Flour',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 15,
        stockReceived: 25,
        stockDelivered: 20,
        stockReturned: 1,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG002',
        deliveryGuyName: 'Suresh Singh',
        product: 'Cooking Oil',
        companyId: 'PRIMA-FT',
        unit: 'l',
        openingStock: 10,
        stockReceived: 20,
        stockDelivered: 15,
        stockReturned: 1,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG002',
        deliveryGuyName: 'Suresh Singh',
        product: 'Sugar',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 12,
        stockReceived: 18,
        stockDelivered: 12,
        stockReturned: 0,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG003',
        deliveryGuyName: 'Amit Sharma',
        product: 'Rice (Basmati)',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 18,
        stockReceived: 25,
        stockDelivered: 20,
        stockReturned: 1,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG003',
        deliveryGuyName: 'Amit Sharma',
        product: 'Milk Powder',
        companyId: 'PRIMA-FT',
        unit: 'kg',
        openingStock: 8,
        stockReceived: 12,
        stockDelivered: 10,
        stockReturned: 0,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG004',
        deliveryGuyName: 'Vikram Patel',
        product: 'Salt',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 5,
        stockReceived: 10,
        stockDelivered: 8,
        stockReturned: 0,
        status: 'Active'
      },
      {
        deliveryGuyId: 'DG004',
        deliveryGuyName: 'Vikram Patel',
        product: 'Wheat Flour',
        companyId: 'PRIMA-SM',
        unit: 'kg',
        openingStock: 10,
        stockReceived: 15,
        stockDelivered: 12,
        stockReturned: 1,
        status: 'Active'
      }
    ];

    // Calculate closing stock for delivery guys
    const processedDeliveryStock = deliveryStockData.map(stock => ({
      ...stock,
      closingStock: stock.openingStock + stock.stockReceived - stock.stockDelivered - stock.stockReturned,
      date: new Date()
    }));

    await DeliveryStock.insertMany(processedDeliveryStock);
    console.log('Added delivery guys stock data');

    console.log('Sample data added successfully!');
    console.log('\n=== MAIN INVENTORY SAMPLE DATA ===');
    console.log('Products added:');
    processedMainStock.forEach(stock => {
      console.log(`- ${stock.product}: Opening=${stock.openingStock}, Purchases=${stock.totalPurchases}, Sales=${stock.totalSales}, Closing=${stock.closingStock}, Available=${stock.stockAvailable}`);
    });

    console.log('\n=== DELIVERY GUYS STOCK SAMPLE DATA ===');
    console.log('Delivery entries added:');
    processedDeliveryStock.forEach(stock => {
      console.log(`- ${stock.deliveryGuyName} (${stock.deliveryGuyId}): ${stock.product} - Opening=${stock.openingStock}, Received=${stock.stockReceived}, Delivered=${stock.stockDelivered}, Returned=${stock.stockReturned}, Closing=${stock.closingStock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();


