const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: true
  },
  specId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarSpec',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
