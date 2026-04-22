const mongoose = require('mongoose');

const etlLogSchema = new mongoose.Schema({
  pipelineName: { type: String, required: true },
  status: { type: String, enum: ['running', 'success', 'failed'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  durationSeconds: { type: Number },
  recordsProcessed: { type: Number, default: 0 },
  errorMessage: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ETLLog', etlLogSchema);
