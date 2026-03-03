require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("\nAdmin already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Use your existing password to login.");
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminData = {
      firstName: "Super",
      lastName: "Admin",
      email: "admin@campushive.com",
      password: "admin123",
      phone: "9876543210",
      role: "admin",
      gender: "male",
      isSuperAdmin: true,
      status: "active",
    };

    await User.create(adminData);

    console.log("\n=== Admin Created Successfully ===");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("Role: admin");
    console.log("==================================\n");
  } catch (error) {
    console.error("Seeding Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();