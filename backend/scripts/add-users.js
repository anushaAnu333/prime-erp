const dotenv = require("dotenv");
const { connectDB } = require("../lib/mongodb.js");
const User = require("../models/User.js");

dotenv.config({ path: "./.env" });

const users = [
  {
    name: "Admin User",
    email: "admin@prima.com",
    password: "admin123",
    role: "admin",
    phone: "+1234567890",
    isActive: true,
    companyAccess: ["all"],
  },
  {
    name: "Manager User",
    email: "manager@prima.com",
    password: "manager123",
    role: "manager",
    phone: "+1234567891",
    isActive: true,
    companyAccess: ["company1", "company2"],
  },
  {
    name: "Accountant User",
    email: "accountant@prima.com",
    password: "accountant123",
    role: "accountant",
    phone: "+1234567892",
    isActive: true,
    companyAccess: ["company1"],
  },
  {
    name: "Agent User",
    email: "agent@prima.com",
    password: "agent123",
    role: "agent",
    phone: "+1234567893",
    isActive: true,
    companyAccess: ["company1"],
  },
];

async function addUsers() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`User ${userData.email} created successfully`);
    }

    console.log("All users added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding users:", error);
    process.exit(1);
  }
}

addUsers();
