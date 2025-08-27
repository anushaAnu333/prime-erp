const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const Customer = require("../models/Customer.js");
const Product = require("../models/Product.js");
const Company = require("../models/Company.js");
const connectDB = require("./mongodb.js");

// Sample data for Prima Sales & Marketing
const companies = [
  {
    companyCode: "PRIMA-SM",
    name: "Prima Sales & Marketing",
    address: "123 Main Street, Bangalore, Karnataka - 560001",
    gstNumber: "29ABCDE1234F1Z5",
    isActive: true,
  },
  {
    companyCode: "PRIMA-FT",
    name: "Prima Foodtech",
    address: "456 Food Street, Mumbai, Maharashtra - 400001",
    gstNumber: "27FGHIJ5678K2Z6",
    isActive: true,
  },
  {
    companyCode: "PRIMA-EX",
    name: "Prima Exports",
    address: "789 Export Road, Delhi, Delhi - 110001",
    gstNumber: "07LMNOP9012Q3Z7",
    isActive: true,
  },
];

const products = [
  {
    productCode: "DOSA001",
    name: "dosa",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    rate: 25,
    gstRate: 5,
    unit: "packet",
    companyId: "PRIMA-SM",
    isActive: true,
  },
  {
    productCode: "IDLI002",
    name: "idli",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    rate: 20,
    gstRate: 5,
    unit: "packet",
    companyId: "PRIMA-SM",
    isActive: true,
  },
  {
    productCode: "CHAP003",
    name: "chapati",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    rate: 30,
    gstRate: 5,
    unit: "packet",
    companyId: "PRIMA-SM",
    isActive: true,
  },
  {
    productCode: "PARA004",
    name: "parata",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    rate: 35,
    gstRate: 5,
    unit: "packet",
    companyId: "PRIMA-SM",
    isActive: true,
  },
  {
    productCode: "PANE005",
    name: "paneer",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    rate: 300,
    gstRate: 12,
    unit: "kg",
    companyId: "PRIMA-SM",
    isActive: true,
  },
  {
    productCode: "PEAS006",
    name: "green peas",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    rate: 80,
    gstRate: 5,
    unit: "kg",
    companyId: "PRIMA-SM",
    isActive: true,
  },
];

// Generate 150 sample customers (shops)
const generateCustomers = () => {
  const customers = [];
  const shopTypes = [
    "Restaurant",
    "Hotel",
    "Cafe",
    "Food Court",
    "Catering",
    "Dhaba",
  ];
  const areas = [
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "Whitefield",
    "Electronic City",
    "Marathahalli",
  ];

  for (let i = 1; i <= 150; i++) {
    const shopType = shopTypes[Math.floor(Math.random() * shopTypes.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const shopNumber = Math.floor(Math.random() * 999) + 1;

    customers.push({
      customerCode: `CUST${String(i).padStart(3, "0")}`,
      name: `Owner ${i}`,
      address: `${shopNumber}, ${area}, Bangalore, Karnataka - 5600${String(
        Math.floor(Math.random() * 99) + 1
      ).padStart(2, "0")}`,
      shopName: `${shopType} ${i}`,
      phoneNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      companyId: "PRIMA-SM",
      currentBalance: Math.floor(Math.random() * 10000),
      isActive: true,
    });
  }

  return customers;
};

const users = [
  {
    email: "admin@prima.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    companyAccess: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    phone: "+919876543210",
  },
  {
    email: "manager@prima.com",
    password: "manager123",
    name: "Manager User",
    role: "manager",
    companyAccess: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    phone: "+919876543211",
  },
  {
    email: "accountant@prima.com",
    password: "accountant123",
    name: "Accountant User",
    role: "accountant",
    companyAccess: ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"],
    phone: "+919876543212",
  },
  {
    email: "agent1@prima.com",
    password: "agent123",
    name: "Delivery Agent 1",
    role: "agent",
    companyAccess: ["PRIMA-SM"],
    phone: "+919876543213",
  },
  {
    email: "agent2@prima.com",
    password: "agent123",
    name: "Delivery Agent 2",
    role: "agent",
    companyAccess: ["PRIMA-SM"],
    phone: "+919876543214",
  },
  {
    email: "agent3@prima.com",
    password: "agent123",
    name: "Delivery Agent 3",
    role: "agent",
    companyAccess: ["PRIMA-SM"],
    phone: "+919876543215",
  },
  {
    email: "agent4@prima.com",
    password: "agent123",
    name: "Delivery Agent 4",
    role: "agent",
    companyAccess: ["PRIMA-SM"],
    phone: "+919876543216",
  },
];

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB successfully!");

    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Company.deleteMany({});
    console.log("✅ Cleared existing data");

    console.log("🏢 Creating companies...");
    const createdCompanies = await Company.create(companies);
    console.log(`✅ Created ${createdCompanies.length} companies`);

    console.log("👥 Creating users...");
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log("🏪 Creating customers (shops)...");
    const customers = generateCustomers();
    const createdCustomers = await Customer.create(customers);
    console.log(`✅ Created ${createdCustomers.length} customers (shops)`);

    console.log("📦 Creating products...");
    const createdProducts = await Product.create(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Summary:");
    console.log(`- Companies: ${createdCompanies.length}`);
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Customers (Shops): ${createdCustomers.length}`);
    console.log(`- Products: ${createdProducts.length}`);

    console.log("\n🔑 Login Credentials:");
    console.log("Admin: admin@prima.com / admin123");
    console.log("Manager: manager@prima.com / manager123");
    console.log("Accountant: accountant@prima.com / accountant123");
    console.log("Agent 1: agent1@prima.com / agent123");
    console.log("Agent 2: agent2@prima.com / agent123");
    console.log("Agent 3: agent3@prima.com / agent123");
    console.log("Agent 4: agent4@prima.com / agent123");

    console.log("\n📦 Available Products:");
    console.log("- Dosa: ₹25/packet (5% GST)");
    console.log("- Idli: ₹20/packet (5% GST)");
    console.log("- Chapati: ₹30/packet (5% GST)");
    console.log("- Parata: ₹35/packet (5% GST)");
    console.log("- Paneer: ₹300/kg (12% GST)");
    console.log("- Green Peas: ₹80/kg (5% GST)");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
