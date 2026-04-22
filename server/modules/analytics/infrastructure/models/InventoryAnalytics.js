const mongoose = require('mongoose');

const inventoryAnalyticsSchema = new mongoose.Schema({
  carTypeName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryAnalytics', inventoryAnalyticsSchema);
