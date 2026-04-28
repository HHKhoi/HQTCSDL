const { Queue } = require('bullmq');
const { connection } = require('../shared/config/redis');

// Centralised cron pattern so it can be changed in one place
const ETL_CRON_PATTERN = '*/5 * * * *'; // every 5 minutes

const etlQueue = new Queue('etl-tasks', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,        // 5s, 25s, 125s
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

/**
 * Registers one repeatable job per pipeline using a stable jobId.
 * Using a stable jobId means calling this function multiple times
 * (e.g. after a worker restart) is idempotent — BullMQ deduplicates
 * based on the key and will not queue the job twice.
 */
const addRepeatableJobs = async (pipelines) => {
  for (const pipeline of pipelines) {
    await etlQueue.add(
      pipeline.name,
      { pipelineName: pipeline.name },
      {
        repeat:  { pattern: ETL_CRON_PATTERN },
        jobId:   `repeatable-${pipeline.name}`, // stable → idempotent registration
      }
    );
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'INFO',
      event: 'repeatable_job_registered',
      pipelineName: pipeline.name,
      cron: ETL_CRON_PATTERN,
    }));
  }
};

module.exports = { etlQueue, addRepeatableJobs, ETL_CRON_PATTERN };

