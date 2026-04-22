const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { runETL } = require('../modules/analytics/infrastructure/jobs/etl-job');

async function triggerETL() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await runETL();

    const DailySalesSummary = mongoose.model('DailySalesSummary');
    const CarModelStats = mongoose.model('CarModelStats');
    const InventoryStats = mongoose.model('InventoryStats');
    const OrderStats = mongoose.model('OrderStats');

    const sales = await DailySalesSummary.find();
    const modelStats = await CarModelStats.find();
    const inventory = await InventoryStats.find();
    const orderStats = await OrderStats.find();

    console.log('Results after ETL:');
    console.log('Daily Sales:', sales.length);
    console.log('Car Model Stats:', modelStats.length);
    console.log('Inventory Stats:', inventory.length);
    console.log('Order Stats:', orderStats.length);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error running ETL:', err);
  }
}

triggerETL();
