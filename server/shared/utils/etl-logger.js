const ETLLog = require('../models/ETLLog');

const etlLogger = {
  info: (pipelineName, message) => {
    console.log(`[ETL][${pipelineName}] INFO: ${message}`);
  },
  
  start: async (pipelineName) => {
    console.log(`[ETL][${pipelineName}] Started`);
    return await ETLLog.create({
      pipelineName,
      status: 'running',
      startTime: new Date()
    });
  },

  success: async (logId, duration, count) => {
    console.log(`[ETL] Pipeline completed in ${duration.toFixed(2)}s. Records: ${count}`);
    await ETLLog.findByIdAndUpdate(logId, {
      status: 'success',
      endTime: new Date(),
      durationSeconds: duration,
      recordsProcessed: count
    });
  },

  error: async (logId, error) => {
    console.error(`[ETL] Pipeline failed: ${error.message}`);
    await ETLLog.findByIdAndUpdate(logId, {
      status: 'failed',
      endTime: new Date(),
      errorMessage: error.message
    });
  }
};

module.exports = etlLogger;
