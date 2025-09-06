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

async function clearCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count existing customers
    const existingCount = await Customer.countDocuments();
    console.log(`Found ${existingCount} existing customers`);

    if (existingCount === 0) {
      console.log('No customers to clear.');
      return;
    }

    // Clear all customers
    const result = await Customer.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} customers from the database`);

  } catch (error) {
    console.error('Error clearing customers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  clearCustomers();
}

module.exports = { clearCustomers };
