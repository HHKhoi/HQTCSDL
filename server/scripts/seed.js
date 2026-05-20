const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8"]);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const User = require("../modules/auth/infrastructure/models/UserModel");
const CarType = require("../modules/car_type/infrastructure/models/CarType");
const CarModel = require("../modules/car_model/infrastructure/models/CarModel");
const CarSpec = require("../modules/car_spec/infrastructure/models/CarSpec");
const Car = require("../modules/car/infrastructure/models/Car");
const Order = require("../modules/order/infrastructure/models/Order");

const BRANDS = [
  {
    name: "Toyota",
    models: ["Camry", "Corolla", "Fortuner", "Land Cruiser", "Zenix"],
  },
  { name: "Honda", models: ["CR-V", "Civic", "City", "Accord", "HR-V"] },
  {
    name: "Mercedes-Benz",
    models: ["GLC 300", "C300 AMG", "E300", "S450", "G63"],
  },
  { name: "BMW", models: ["X5", "320i", "530i", "740Li", "M4"] },
  { name: "Audi", models: ["Q5", "A4", "A6", "Q7", "R8"] },
  {
    name: "Hyundai",
    models: ["Santa Fe", "Tucson", "Creta", "Elantra", "Ioniq 5"],
  },
];

const TYPES = ["SUV", "Sedan", "Coupe", "Hatchback", "Electric"];

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomArrayItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    console.log("Clearing old data...");
    await Promise.all([
      User.deleteMany(),
      CarType.deleteMany(),
      CarModel.deleteMany(),
      CarSpec.deleteMany(),
      Car.deleteMany(),
      Order.deleteMany(),
    ]);

    // 1. Create Admin
    await User.create({
      email: "admin@autohub.com",
      password: "password123",
      role: "admin",
    });
    console.log("Admin user created");

    // 2. Create Types
    const typeDocs = await CarType.insertMany(TYPES.map((name) => ({ name })));
    console.log("Car Types created");

    // 3. Create Models
    const modelDocs = [];
    for (const brand of BRANDS) {
      for (const modelName of brand.models) {
        const doc = await CarModel.create({
          name: modelName,
          brand: brand.name,
          carTypeId: getRandomArrayItem(typeDocs)._id,
        });
        modelDocs.push(doc);
      }
    }
    console.log("Car Models created");

    // 4. Create Cars, Specs, and Orders (150 records)
    console.log("Generating 150 realistic cars...");
    for (let i = 0; i < 150; i++) {
      const model = getRandomArrayItem(modelDocs);

      // Create Spec
      const specs = [
        {
          key: "Engine",
          value: `${getRandomInt(2, 6)}.0L ${getRandomArrayItem(["V6", "V8", "I4", "Flat-6"])}`,
        },
        { key: "Horsepower", value: `${getRandomInt(150, 600)} HP` },
        {
          key: "Transmission",
          value: getRandomArrayItem(["Automatic", "Manual", "DCT", "PDK"]),
        },
        {
          key: "FuelType",
          value: getRandomArrayItem([
            "Gasoline",
            "Diesel",
            "Electric",
            "Hybrid",
          ]),
        },
        {
          key: "Color",
          value: getRandomArrayItem([
            "Black Metallic",
            "Arctic White",
            "Signal Red",
            "Shark Blue",
            "Chalk Silver",
          ]),
        },
      ];

      const specDoc = await CarSpec.create({ specs });

      // Create Car
      const status = i < 50 ? "sold" : i < 70 ? "reserved" : "available";
      const price =
        model.brand === "Porsche"
          ? getRandomInt(100, 300) * 1000
          : getRandomInt(30, 80) * 1000;

      const carDoc = await Car.create({
        modelId: model._id,
        specId: specDoc._id,
        price,
        status,
      });

      // Create Order for sold cars
      if (status === "sold") {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();

        await Order.create({
          carId: carDoc._id,
          price: carDoc.price,
          orderCode: `ORD-${date}-${random}`,
          status: 'completed',
          createdAt: new Date(
            Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000,
          ), // Random date in last 30 days
        });
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
