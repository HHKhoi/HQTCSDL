const salesPipeline = require('./pipelines/sales.pipeline');
const inventoryPipeline = require('./pipelines/inventory.pipeline');

module.exports = [
  salesPipeline,
  inventoryPipeline
];
