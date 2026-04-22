const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  carTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarType',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CarModel', carModelSchema);
