const ETLLog = require('../models/ETLLog');

// Log format helper — outputs one JSON line per event for easy log aggregation.
const fmt = (level, pipelineName, message, extra = {}) => {
  const entry = { ts: new Date().toISOString(), level, pipelineName, message, ...extra };
  if (level === 'ERROR') {
    console.error(JSON.stringify(entry));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
};

const etlLogger = {
  /**
   * Called at the start of every pipeline run.
   * Returns the ETLLog document whose _id is passed to all subsequent calls.
   */
  start: async (pipelineName) => {
    fmt('INFO', pipelineName, 'Pipeline started');
    return await ETLLog.create({ pipelineName, status: 'running', startTime: new Date() });
  },

  /**
   * Called after a successful load.  Persists all structured counters.
   * @param {string} logId
   * @param {number} durationSeconds
   * @param {{ extracted, transformed, upserted }} counts
   */
  success: async (logId, durationSeconds, counts = {}) => {
    const { extracted = 0, transformed = 0, upserted = 0 } = counts;
    fmt('INFO', '—', 'Pipeline completed', { durationSeconds: durationSeconds.toFixed(2), extracted, transformed, upserted });
    await ETLLog.findByIdAndUpdate(logId, {
      status: 'success',
      endTime: new Date(),
      durationSeconds,
      recordsExtracted:   extracted,
      recordsTransformed: transformed,
      recordsUpserted:    upserted,
      recordsProcessed:   upserted, // backwards compat
    });
  },

  /**
   * Called when extract returns 0 records (no-op run, not a failure).
   */
  warn: async (logId, pipelineName, message) => {
    fmt('WARN', pipelineName, message);
    await ETLLog.findByIdAndUpdate(logId, {
      status: 'warned',
      endTime: new Date(),
      warningMessage: message,
    });
  },

  /**
   * Called on any unhandled error inside the pipeline lifecycle.
   */
  error: async (logId, pipelineName, error) => {
    fmt('ERROR', pipelineName, 'Pipeline failed', { error: error.message });
    await ETLLog.findByIdAndUpdate(logId, {
      status: 'failed',
      endTime: new Date(),
      errorMessage: error.message,
    });
  },
};

module.exports = etlLogger;

