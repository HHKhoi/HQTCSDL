const { Worker } = require('bullmq');
const { connection } = require('../shared/config/redis');
const pipelines = require('./registry');

// Build a name → pipeline instance lookup for O(1) job dispatch
const pipelineMap = new Map(pipelines.map((p) => [p.name, p]));

const startWorker = () => {
  const worker = new Worker(
    'etl-tasks',
    async (job) => {
      const { pipelineName } = job.data;
      const pipeline = pipelineMap.get(pipelineName);

      if (!pipeline) {
        throw new Error(`[Worker] Pipeline "${pipelineName}" not found in registry`);
      }

      // pipeline.run() handles the full lifecycle:
      //   init → extract → transform → load → finalize
      // Logging and SyncState updates are all handled inside run().
      const result = await pipeline.run();
      return result;
    },
    {
      connection,
      // Limit to 1 concurrent ETL job to prevent OLTP overload
      concurrency: 1,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'INFO',
      event: 'job_completed',
      jobId: job.id,
      pipelineName: job.data.pipelineName,
      ...result,
    }));
  });

  worker.on('failed', (job, err) => {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'ERROR',
      event: 'job_failed',
      jobId: job.id,
      pipelineName: job.data.pipelineName,
      attempt: job.attemptsMade,
      error: err.message,
    }));
  });

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'INFO',
    event: 'worker_started',
    registeredPipelines: [...pipelineMap.keys()],
  }));

  return worker;
};

module.exports = { startWorker };

