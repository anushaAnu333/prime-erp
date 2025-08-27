const mongoose = require("mongoose");

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/prima-erp";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return false;
  }
};

// Customer Schema
const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Shop name cannot exceed 100 characters"],
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, "Credit limit cannot be negative"],
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Food", "Dairy", "Frozen", "Beverages", "Snacks", "Other"],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, "Unit cannot exceed 20 characters"],
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: [0, "Selling price cannot be negative"],
    },
    gstRate: {
      type: Number,
      required: true,
      enum: [0, 5, 12, 18, 28],
      default: 5,
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^\d{4,8}$/, "HSN code must be 4-8 digits"],
    },
    expiryDays: {
      type: Number,
      default: 0,
      min: [0, "Expiry days cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    companyId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);
const Product = mongoose.model("Product", productSchema);

async function seedSalesData() {
  console.log("🌱 Seeding Sales Data...\n");

  // Test connection
  const connected = await connectDB();
  if (!connected) {
    console.log("❌ Database test failed - cannot connect");
    return;
  }

  try {
    // Sample customers
    const customers = [
      {
        customerCode: "CUST001",
        name: "Rajesh Kumar",
        shopName: "Kumar General Store",
        address: {
          street: "123 Main Street",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
        },
        phone: "9876543210",
        email: "rajesh@kumarstore.com",
        gstNumber: "29ABCDE1234F1Z5",
        creditLimit: 50000,
        currentBalance: 0,
        companyId: "company1",
      },
      {
        customerCode: "CUST002",
        name: "Priya Sharma",
        shopName: "Sharma Supermarket",
        address: {
          street: "456 Park Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560002",
        },
        phone: "9876543211",
        email: "priya@sharmamart.com",
        gstNumber: "29FGHIJ5678K2Z6",
        creditLimit: 75000,
        currentBalance: 1500,
        companyId: "company1",
      },
      {
        customerCode: "CUST003",
        name: "Amit Patel",
        shopName: "Patel Food Center",
        address: {
          street: "789 Lake View",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560003",
        },
        phone: "9876543212",
        email: "amit@patelfoods.com",
        gstNumber: "29KLMNO9012P3Z7",
        creditLimit: 100000,
        currentBalance: 2500,
        companyId: "company1",
      },
      {
        customerCode: "CUST004",
        name: "Sunita Reddy",
        shopName: "Reddy Provisions",
        address: {
          street: "321 Hill Street",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560004",
        },
        phone: "9876543213",
        email: "sunita@reddyprovisions.com",
        gstNumber: "29QRSTU3456V4Z8",
        creditLimit: 60000,
        currentBalance: 0,
        companyId: "company1",
      },
      {
        customerCode: "CUST005",
        name: "Vikram Singh",
        shopName: "Singh Grocery",
        address: {
          street: "654 Market Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560005",
        },
        phone: "9876543214",
        email: "vikram@singhgrocery.com",
        gstNumber: "29WXYZ7890A5Z9",
        creditLimit: 80000,
        currentBalance: 3000,
        companyId: "company1",
      },
    ];

    // Sample products
    const products = [
      {
        productCode: "PROD001",
        name: "Dosa Mix",
        category: "Food",
        unit: "Packet",
        sellingPrice: 45,
        gstRate: 5,
        hsnCode: "1901",
        expiryDays: 180,
        companyId: "company1",
      },
      {
        productCode: "PROD002",
        name: "Idli Mix",
        category: "Food",
        unit: "Packet",
        sellingPrice: 40,
        gstRate: 5,
        hsnCode: "1901",
        expiryDays: 180,
        companyId: "company1",
      },
      {
        productCode: "PROD003",
        name: "Paneer",
        category: "Dairy",
        unit: "Kg",
        sellingPrice: 350,
        gstRate: 12,
        hsnCode: "0406",
        expiryDays: 7,
        companyId: "company1",
      },
      {
        productCode: "PROD004",
        name: "Ghee",
        category: "Dairy",
        unit: "Litre",
        sellingPrice: 280,
        gstRate: 12,
        hsnCode: "0405",
        expiryDays: 365,
        companyId: "company1",
      },
      {
        productCode: "PROD005",
        name: "Frozen Peas",
        category: "Frozen",
        unit: "Kg",
        sellingPrice: 120,
        gstRate: 18,
        hsnCode: "0710",
        expiryDays: 365,
        companyId: "company1",
      },
      {
        productCode: "PROD006",
        name: "Biscuits",
        category: "Snacks",
        unit: "Pack",
        sellingPrice: 25,
        gstRate: 18,
        hsnCode: "1905",
        expiryDays: 180,
        companyId: "company1",
      },
      {
        productCode: "PROD007",
        name: "Tea Powder",
        category: "Beverages",
        unit: "Kg",
        sellingPrice: 180,
        gstRate: 5,
        hsnCode: "0902",
        expiryDays: 365,
        companyId: "company1",
      },
      {
        productCode: "PROD008",
        name: "Coffee Powder",
        category: "Beverages",
        unit: "Kg",
        sellingPrice: 220,
        gstRate: 5,
        hsnCode: "0901",
        expiryDays: 365,
        companyId: "company1",
      },
    ];

    // Clear existing data
    await Customer.deleteMany({ companyId: "company1" });
    await Product.deleteMany({ companyId: "company1" });

    // Insert customers
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n🎉 Sales data seeding completed successfully!");
    console.log("\n📋 Sample Data Summary:");
    console.log(`- Customers: ${createdCustomers.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log("\n🔗 You can now test the sales invoice creation system!");
  } catch (error) {
    console.error("❌ Error seeding sales data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedSalesData();
