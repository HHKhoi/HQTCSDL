const mongoose = require("mongoose");

exports.connect = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const maskedUri = uri.replace(/\/\/.*@/, "//***:***@");
    console.log(`Connecting to MongoDB at: ${maskedUri}`);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
