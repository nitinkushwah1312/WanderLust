const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// Correct MongoDB Atlas connection URI with DB name
const MONGO_URL = "mongodb+srv://developmentdsa70:gU5FaYvHmrRTonxs@cluster0.jfthhct.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
main()
  .then(() => {
    console.log("✅ Connected to DB");
    return initDB(); // Only initialize data after successful DB connection
  })
  .catch((err) => {
    console.error("❌ Error connecting to DB:", err);
  });

async function main() {
  // ✅ No need for useNewUrlParser or useUnifiedTopology in latest Mongoose
  await mongoose.connect(MONGO_URL);
}

// Initialize the database
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "685528f46739089992146d39",
    }));
    await Listing.insertMany(initData.data);
    console.log("✅ Data was initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing data:", err);
  }
};