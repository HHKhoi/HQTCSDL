const mongoose = require('mongoose');

// Tracks per-pipeline incremental processing state.
// lastSyncTime is the high-water mark: "all records with updatedAt <= this
// have already been processed."  It is updated ONLY after a successful load.
const syncStateSchema = new mongoose.Schema(
  {
    pipelineName: {
      type: String,
      required: true,
      unique: true,        // one record per pipeline
    },
    lastSyncTime: {
      type: Date,
      required: true,
    },
    lastRunStatus: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SyncState', syncStateSchema);
