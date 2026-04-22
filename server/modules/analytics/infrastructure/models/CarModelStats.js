const mongoose = require('mongoose');

const carModelStatsSchema = new mongoose.Schema({
  modelName: { type: String, required: true, unique: true },
  brand: { type: String },
  unitsSold: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  averagePrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CarModelStats', carModelStatsSchema);
