const dotenv = require("dotenv");
const { connectDB } = require("../lib/mongodb.js");
const Vendor = require("../lib/models/Vendor.js");

dotenv.config({ path: "./.env" });

const vendors = [
  {
    vendorCode: "VEN001",
    vendorName: "Chemical Industries Pvt Ltd",
    contactPerson: "John Smith",
    address: "123 Industrial Area, Mumbai, Maharashtra 400001",
    phone: "+91-9876543210",
    email: "john@chemicalindustries.com",
    gstNumber: "27ABCDE1234F1Z5",
    paymentTerms: "30 days",
    currentBalance: 0,
    isActive: true,
  },
  {
    vendorCode: "VEN002",
    vendorName: "Food Products Ltd",
    contactPerson: "Sarah Johnson",
    address: "456 Business Park, Delhi, Delhi 110001",
    phone: "+91-9876543211",
    email: "sarah@foodproducts.com",
    gstNumber: "07FGHIJ5678K2L6",
    paymentTerms: "15 days",
    currentBalance: 0,
    isActive: true,
  },
  {
    vendorCode: "VEN003",
    vendorName: "Agro Supplies Co",
    contactPerson: "Mike Wilson",
    address: "789 Farm Road, Bangalore, Karnataka 560001",
    phone: "+91-9876543212",
    email: "mike@agrosupplies.com",
    gstNumber: "29MNOPQ9012R3S7",
    paymentTerms: "45 days",
    currentBalance: 0,
    isActive: true,
  },
];

async function addVendors() {
  try {
    await connectDB();

    for (const vendorData of vendors) {
      // Check if vendor already exists
      const existingVendor = await Vendor.findOne({ vendorCode: vendorData.vendorCode });

      if (existingVendor) {
        continue;
      }

      // Create new vendor
      const vendor = new Vendor(vendorData);
      await vendor.save();
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

addVendors();













