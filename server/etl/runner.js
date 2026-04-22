const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../shared/database/db');
const pipelines = require('./registry');
const { addRepeatableJobs, etlQueue } = require('./queue');
const { startWorker } = require('./worker');

const start = async () => {
  try {
    await db.connect();
    console.log('[Runner] Connected to MongoDB');
    
    // Start BullMQ Worker
    startWorker();
    
    // Initialize schedules
    await addRepeatableJobs(pipelines);

    console.log('[Runner] ETL Orchestrator is active with BullMQ');
    
    // For manual testing/initial run, we can also add one-off jobs
    for (const pipeline of pipelines) {
      await etlQueue.add(`${pipeline.name}-initial`, { pipelineName: pipeline.name });
    }
    
  } catch (err) {
    console.error('[Runner] Initialization failed', err);
    process.exit(1);
  }
};

start();
