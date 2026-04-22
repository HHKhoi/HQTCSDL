const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const Car = mongoose.model('Car', new mongoose.Schema({}, { strict: false }));
    const CarModel = mongoose.model('CarModel', new mongoose.Schema({}, { strict: false }));

    const orderCount = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const carCount = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'available' });
    const modelCount = await CarModel.countDocuments();

    console.log('Order counts:', { total: orderCount, completed: completedOrders });
    console.log('Car counts:', { total: carCount, available: availableCars });
    console.log('Model counts:', modelCount);

    if (completedOrders > 0) {
      const sampleOrder = await Order.findOne({ status: 'completed' });
      console.log('Sample completed order:', JSON.stringify(sampleOrder, null, 2));
    }

    if (availableCars > 0) {
        const sampleCar = await Car.findOne({ status: 'available' });
        console.log('Sample available car:', JSON.stringify(sampleCar, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking data:', err);
  }
}

checkData();
