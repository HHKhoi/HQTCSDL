const mongoose = require('mongoose');

const dailySalesSummarySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  revenue: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  aov: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DailySalesSummary', dailySalesSummarySchema);
