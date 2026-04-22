const mongoose = require('mongoose');

const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
    unique: true
  },
  revenue: {
    type: Number,
    default: 0
  },
  ordersCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
