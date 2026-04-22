const mongoose = require('mongoose');

const specItemSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: [
      'Engine', 
      'Transmission', 
      'FuelType', 
      'Horsepower', 
      'Torque',
      'Color', 
      'Seat', 
      'WheelSize',
      'DriveType',
      'Entertainment'
    ]
  },
  value: {
    type: String,
    required: true
  }
}, { _id: false });

const carSpecSchema = new mongoose.Schema({
  specs: [specItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('CarSpec', carSpecSchema);
