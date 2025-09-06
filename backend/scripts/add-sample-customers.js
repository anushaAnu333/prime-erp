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

// Sample data arrays for generating realistic customers
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vedant', 'Kabir', 'Shivansh', 'Aryan', 'Dhruv', 'Kian',
  'Arnav', 'Ritvik', 'Viaan', 'Aarush', 'Rudra', 'Priyanshu', 'Ansh', 'Yuvaan', 'Raghav', 'Darsh',
  'Saanvi', 'Aditi', 'Ananya', 'Diya', 'Pihu', 'Prisha', 'Inaya', 'Kiara', 'Aadhya', 'Kavya',
  'Anika', 'Riya', 'Myra', 'Sara', 'Navya', 'Ira', 'Tara', 'Zara', 'Avni', 'Pari'
];

const lastNames = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Goel',
  'Arora', 'Chopra', 'Malhotra', 'Kapoor', 'Mehta', 'Saxena', 'Joshi', 'Tiwari', 'Pandey', 'Srivastava',
  'Yadav', 'Mishra', 'Dubey', 'Shukla', 'Tripathi', 'Chandra', 'Bhardwaj', 'Aggarwal', 'Goyal', 'Jindal'
];

const shopTypes = [
  'General Store', 'Medical Store', 'Grocery Shop', 'Electronics Store', 'Clothing Store', 
  'Hardware Store', 'Stationery Shop', 'Mobile Store', 'Gift Shop', 'Book Store',
  'Cosmetics Store', 'Sports Store', 'Toy Store', 'Jewelry Store', 'Bakery',
  'Sweet Shop', 'Tea Stall', 'Cyber Cafe', 'Photo Studio', 'Repair Shop'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi'
];

const areas = [
  'Market', 'Nagar', 'Colony', 'Road', 'Street', 'Avenue', 'Plaza', 'Complex', 'Park', 'Garden',
  'Sector', 'Block', 'Phase', 'Extension', 'Layout', 'Town', 'City', 'Junction', 'Circle', 'Square'
];


// Function to generate random customer data
function generateCustomer(index) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const shopType = shopTypes[Math.floor(Math.random() * shopTypes.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  
  // Generate customer code with padding
  const customerCode = `CUST${String(index + 1).padStart(4, '0')}`;
  
  // Generate phone number
  const phoneNumber = `+91${Math.floor(Math.random() * 900000000) + 100000000}`;
  
  // Generate email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${shopType.toLowerCase().replace(/\s+/g, '')}mail.com`;
  
  // Generate address
  const houseNo = Math.floor(Math.random() * 999) + 1;
  const address = `${houseNo}, ${area} ${shopType}, ${city}`;
  
  // Generate shop name
  const shopName = `${firstName}'s ${shopType}`;
  
  // Generate random balance (0 to 50000)
  const currentBalance = Math.floor(Math.random() * 50000);
  
  return {
    customerCode,
    name: `${firstName} ${lastName}`,
    address,
    shopName,
    phoneNumber,
    email,
    currentBalance
  };
}

async function addSampleCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if customers already exist
    const existingCustomers = await Customer.countDocuments();
    console.log(`Found ${existingCustomers} existing customers`);

    if (existingCustomers >= 100) {
      console.log('100 or more customers already exist. Skipping seed process.');
      console.log('If you want to add more customers, you can modify this script or delete existing ones first.');
      return;
    }

    // Generate 100 sample customers
    const customers = [];
    for (let i = 0; i < 100; i++) {
      customers.push(generateCustomer(i));
    }

    console.log('Generated 100 sample customers');
    console.log('Sample customer:', customers[0]);

    // Insert customers in batches to avoid overwhelming the database
    const batchSize = 20;
    let insertedCount = 0;

    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      try {
        await Customer.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/5 - ${insertedCount} customers total`);
      } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: Some customers already exist, skipping duplicates`);
          // Try inserting one by one for this batch
          for (const customer of batch) {
            try {
              await Customer.create(customer);
              insertedCount++;
            } catch (singleError) {
              if (singleError.code !== 11000) {
                console.error(`Error inserting customer ${customer.customerCode}:`, singleError.message);
              }
            }
          }
        } else {
          console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully added ${insertedCount} customers to the database!`);
    
    // Show summary
    const totalCustomers = await Customer.countDocuments();

    console.log(`\n📊 Database Summary:`);
    console.log(`Total customers: ${totalCustomers}`);

    // Show some sample customers
    const sampleCustomers = await Customer.find().limit(5).select('customerCode name shopName currentBalance');
    console.log(`\n📋 Sample customers:`);
    sampleCustomers.forEach(customer => {
      console.log(`  ${customer.customerCode} - ${customer.name} (${customer.shopName}) - Balance: ₹${customer.currentBalance}`);
    });

  } catch (error) {
    console.error('Error adding sample customers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addSampleCustomers();
}

module.exports = { addSampleCustomers };
