require("dotenv").config({ path: ".env.local" });
const { connectDB } = require("./lib/mongodb.cjs");
const Vendor = require("./models/Vendor.cjs");
const Stock = require("./models/Stock");

// Simple vendor code generator
function generateVendorCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `VEND${timestamp}${random}`;
}

async function seedPurchaseData() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Sample vendors for each company
    const vendors = [
      // PRIMA-SM Vendors
      {
        vendorCode: generateVendorCode(),
        vendorName: "Fresh Foods Supplier",
        contactPerson: "Rajesh Kumar",
        address: "123 Food Street, Mumbai, Maharashtra - 400001",
        phone: "+91-9876543210",
        email: "rajesh@freshfoods.com",
        gstNumber: "27AABCF1234A1Z5",
        paymentTerms: "30 days",
        currentBalance: 0,
        companyId: "PRIMA-SM",
        isActive: true,
      },
      {
        vendorCode: generateVendorCode(),
        vendorName: "Quality Ingredients Co.",
        contactPerson: "Priya Sharma",
        address: "456 Ingredient Lane, Delhi, Delhi - 110001",
        phone: "+91-9876543211",
        email: "priya@qualityingredients.com",
        gstNumber: "07AABCF5678B2Z6",
        paymentTerms: "15 days",
        currentBalance: 0,
        companyId: "PRIMA-SM",
        isActive: true,
      },
      {
        vendorCode: generateVendorCode(),
        vendorName: "Organic Products Ltd.",
        contactPerson: "Amit Patel",
        address: "789 Organic Road, Bangalore, Karnataka - 560001",
        phone: "+91-9876543212",
        email: "amit@organicproducts.com",
        gstNumber: "29AABCF9012C3Z7",
        paymentTerms: "45 days",
        currentBalance: 0,
        companyId: "PRIMA-SM",
        isActive: true,
      },

      // PRIMA-FT Vendors
      {
        vendorCode: generateVendorCode(),
        vendorName: "Premium Food Traders",
        contactPerson: "Sneha Reddy",
        address: "321 Trade Center, Hyderabad, Telangana - 500001",
        phone: "+91-9876543213",
        email: "sneha@premiumfood.com",
        gstNumber: "36AABCF3456D4Z8",
        paymentTerms: "30 days",
        currentBalance: 0,
        companyId: "PRIMA-FT",
        isActive: true,
      },
      {
        vendorCode: generateVendorCode(),
        vendorName: "Global Food Imports",
        contactPerson: "Vikram Singh",
        address: "654 Import Street, Chennai, Tamil Nadu - 600001",
        phone: "+91-9876543214",
        email: "vikram@globalfood.com",
        gstNumber: "33AABCF7890E5Z9",
        paymentTerms: "60 days",
        currentBalance: 0,
        companyId: "PRIMA-FT",
        isActive: true,
      },

      // PRIMA-EX Vendors
      {
        vendorCode: generateVendorCode(),
        vendorName: "Export Quality Foods",
        contactPerson: "Meera Iyer",
        address: "987 Export Zone, Kochi, Kerala - 682001",
        phone: "+91-9876543215",
        email: "meera@exportquality.com",
        gstNumber: "32AABCF1234F6Z1",
        paymentTerms: "30 days",
        currentBalance: 0,
        companyId: "PRIMA-EX",
        isActive: true,
      },
      {
        vendorCode: generateVendorCode(),
        vendorName: "International Food Corp",
        contactPerson: "Arjun Menon",
        address: "147 International Road, Pune, Maharashtra - 411001",
        phone: "+91-9876543216",
        email: "arjun@internationalfood.com",
        gstNumber: "27AABCF5678G7Z2",
        paymentTerms: "45 days",
        currentBalance: 0,
        companyId: "PRIMA-EX",
        isActive: true,
      },
    ];

    // Clear existing vendors
    await Vendor.deleteMany({});
    console.log("Cleared existing vendors");

    // Insert vendors
    const createdVendors = await Vendor.insertMany(vendors);
    console.log(`Created ${createdVendors.length} vendors`);

    // Initialize stock for all products across all companies
    const products = [
      "dosa",
      "idli",
      "chapati",
      "parata",
      "paneer",
      "green peas",
    ];
    const companies = ["PRIMA-SM", "PRIMA-FT", "PRIMA-EX"];

    // Clear existing stock
    await Stock.deleteMany({});
    console.log("Cleared existing stock");

    const stockRecords = [];
    for (const company of companies) {
      for (const product of products) {
        stockRecords.push({
          productName: product,
          companyId: company,
          currentStock: Math.floor(Math.random() * 100) + 50, // Random stock between 50-150
          totalPurchases: Math.floor(Math.random() * 500) + 200,
          totalReturns: Math.floor(Math.random() * 50),
          totalSales: Math.floor(Math.random() * 300) + 100,
          lastUpdated: new Date(),
        });
      }
    }

    const createdStock = await Stock.insertMany(stockRecords);
    console.log(`Created ${createdStock.length} stock records`);

    console.log("Purchase data seeding completed successfully!");
    console.log("\nSample vendors created:");
    createdVendors.forEach((vendor) => {
      console.log(
        `- ${vendor.vendorName} (${vendor.companyId}) - ${vendor.contactPerson}`
      );
    });

    console.log("\nStock initialized for all products across all companies");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding purchase data:", error);
    process.exit(1);
  }
}

seedPurchaseData();
