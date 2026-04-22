const mongoose = require('mongoose');

const topModelsAnalyticsSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true
  },
  unitsSold: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TopModelsAnalytics', topModelsAnalyticsSchema);
