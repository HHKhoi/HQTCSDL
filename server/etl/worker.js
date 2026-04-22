const { Worker } = require('bullmq');
const { connection } = require('../shared/config/redis');
const pipelines = require('./registry');
const logger = require('../shared/utils/etl-logger');

const startWorker = () => {
  const worker = new Worker(
    'etl-tasks',
    async (job) => {
      const { pipelineName } = job.data;
      const pipeline = pipelines.find(p => p.name === pipelineName);
      
      if (!pipeline) {
        throw new Error(`Pipeline ${pipelineName} not found in registry`);
      }

      console.log(`[Worker] Processing job: ${job.id} for pipeline: ${pipelineName}`);
      const start = Date.now();
      const log = await logger.start(pipeline.name);

      try {
        const raw = await pipeline.extract();
        const transformed = await pipeline.transform(raw);
        const count = await pipeline.load(transformed);
        
        const duration = (Date.now() - start) / 1000;
        await logger.success(log._id, duration, count);
        return { success: true, count };
      } catch (error) {
        await logger.error(log._id, error);
        throw error;
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
  });

  console.log('[Worker] ETL Worker started and listening for jobs');
  return worker;
};

module.exports = { startWorker };
