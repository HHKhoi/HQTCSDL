// Each pipeline file exports a singleton ETLPipeline instance.
// The worker uses pipeline.name and pipeline.run() from the base class.
const salesPipeline     = require('./pipelines/sales.pipeline');
const inventoryPipeline = require('./pipelines/inventory.pipeline');

module.exports = [salesPipeline, inventoryPipeline];

