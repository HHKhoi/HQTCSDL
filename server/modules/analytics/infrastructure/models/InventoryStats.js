const mongoose = require('mongoose');

const inventoryStatsSchema = new mongoose.Schema({
  modelName: { type: String, required: true, unique: true },
  brand: { type: String },
  inStock: { type: Number, default: 0 },
  avgDaysInInventory: { type: Number, default: 0 },
  agingBuckets: {
    '0-30': { type: Number, default: 0 },
    '30-60': { type: Number, default: 0 },
    '60+': { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryStats', inventoryStatsSchema);
