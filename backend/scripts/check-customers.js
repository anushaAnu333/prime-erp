const mongoose = require('mongoose');
require('dotenv').config();

// Customer Model
const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: [true, "Customer code is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: [100, "Shop name cannot exceed 100 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d\-\s()]{0,20}$/, "Please enter a valid phone number"],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
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

const Customer = mongoose.model('Customer', customerSchema);

async function checkCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count customers
    const totalCustomers = await Customer.countDocuments();
    console.log(`\n📊 Database Summary:`);
    console.log(`Total customers: ${totalCustomers}`);

    if (totalCustomers > 0) {
      // Show some sample customers
      const sampleCustomers = await Customer.find().limit(5).select('customerCode name shopName currentBalance companyId');
      console.log(`\n📋 Sample customers:`);
      sampleCustomers.forEach(customer => {
        const companyInfo = customer.companyId ? ` (Company: ${customer.companyId})` : ' (No Company)';
        console.log(`  ${customer.customerCode} - ${customer.name} (${customer.shopName}) - Balance: ₹${customer.currentBalance}${companyInfo}`);
      });

      // Check if any customers have companyId
      const customersWithCompany = await Customer.countDocuments({ companyId: { $ne: null } });
      console.log(`\n🏢 Customers with company assignment: ${customersWithCompany}`);
      console.log(`📝 Customers without company assignment: ${totalCustomers - customersWithCompany}`);
    }

  } catch (error) {
    console.error('Error checking customers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  checkCustomers();
}

module.exports = { checkCustomers };
