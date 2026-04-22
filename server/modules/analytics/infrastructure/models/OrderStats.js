const mongoose = require('mongoose');

const orderStatsSchema = new mongoose.Schema({
  metric: { type: String, required: true, unique: true }, // e.g. "distribution"
  data: {
    pending: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    avgProcessingTimeHours: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('OrderStats', orderStatsSchema);
