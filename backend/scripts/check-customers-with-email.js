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
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);

async function checkCustomersWithEmail() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count customers
    const totalCustomers = await Customer.countDocuments();
    console.log(`\n📊 Database Summary:`);
    console.log(`Total customers: ${totalCustomers}`);

    if (totalCustomers > 0) {
      // Show some sample customers with email
      const sampleCustomers = await Customer.find().limit(5).select('customerCode name shopName email phoneNumber currentBalance');
      console.log(`\n📋 Sample customers with email:`);
      sampleCustomers.forEach(customer => {
        console.log(`  ${customer.customerCode} - ${customer.name}`);
        console.log(`    Shop: ${customer.shopName}`);
        console.log(`    Email: ${customer.email || 'No email'}`);
        console.log(`    Phone: ${customer.phoneNumber}`);
        console.log(`    Balance: ₹${customer.currentBalance}`);
        console.log('');
      });

      // Check if customers have email
      const customersWithEmail = await Customer.countDocuments({ email: { $ne: null, $ne: '' } });
      console.log(`📧 Customers with email: ${customersWithEmail}`);
      console.log(`📝 Customers without email: ${totalCustomers - customersWithEmail}`);
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
  checkCustomersWithEmail();
}

module.exports = { checkCustomersWithEmail };
