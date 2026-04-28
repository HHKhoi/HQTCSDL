const mongoose = require('mongoose');

// Structured run log written by ETLPipeline base class.
// Each pipeline run creates one document: status is updated from
// 'running' -> 'success' | 'failed' at the end of the run.
const etlLogSchema = new mongoose.Schema(
  {
    pipelineName:        { type: String, required: true },
    status:              { type: String, enum: ['running', 'success', 'failed', 'warned'], required: true },
    startTime:           { type: Date, default: Date.now },
    endTime:             { type: Date },
    durationSeconds:     { type: Number },
    // Granular counters for observability dashboards
    recordsExtracted:    { type: Number, default: 0 },
    recordsTransformed:  { type: Number, default: 0 },
    recordsUpserted:     { type: Number, default: 0 },
    // Kept for backwards compatibility
    recordsProcessed:    { type: Number, default: 0 },
    errorMessage:        { type: String },
    warningMessage:      { type: String },
    metadata:            { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Fast lookup for monitoring dashboards (recent runs per pipeline)
etlLogSchema.index({ pipelineName: 1, startTime: -1 });

module.exports = mongoose.model('ETLLog', etlLogSchema);
