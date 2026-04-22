const { Queue } = require('bullmq');
const { connection } = require('../shared/config/redis');

const etlQueue = new Queue('etl-tasks', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  }
});

const addRepeatableJobs = async (pipelines) => {
  // Clean old repeatable jobs
  const jobs = await etlQueue.getRepeatableJobs();
  for (const job of jobs) {
    await etlQueue.removeRepeatableByKey(job.key);
  }

  // Add new ones
  for (const pipeline of pipelines) {
    await etlQueue.add(
      pipeline.name, 
      { pipelineName: pipeline.name }, 
      { 
        repeat: { pattern: '*/5 * * * *' } // Every 5 minutes
      }
    );
    console.log(`[Queue] Added repeatable job for: ${pipeline.name}`);
  }
};

module.exports = {
  etlQueue,
  addRepeatableJobs
};
