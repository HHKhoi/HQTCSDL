const ETLPipeline = require('../core/ETLPipeline');
const Car = require('../../modules/car/infrastructure/models/Car');
const Order = require('../../modules/order/infrastructure/models/Order');
const InventoryStats = require('../../modules/analytics/infrastructure/models/InventoryStats');
const OrderStats = require('../../modules/analytics/infrastructure/models/OrderStats');

// Milliseconds in a day — used for aging bucket calculations
const MS_PER_DAY = 1000 * 60 * 60 * 24;

class InventoryPipeline extends ETLPipeline {
  constructor() {
    super('inventory-analytics');
  }

  // ─── EXTRACT ──────────────────────────────────────────────────────────────
  // Two separate delta queries are run:
  //   - Cars updated since lastSyncTime (inventory changes)
  //   - Orders updated since lastSyncTime (operational stats changes)
  // Both use cursors to avoid heap overload.
  async extract(options) {
    const sinceTime = options.isBackfill ? new Date(0) : this.syncState.lastSyncTime;

    const carCursor = Car.find({ updatedAt: { $gt: sinceTime } })
      .select('_id modelId status updatedAt')
      .lean()
      .cursor();

    const orderCursor = Order.find({ updatedAt: { $gt: sinceTime } })
      .select('_id status createdAt completedAt updatedAt')
      .lean()
      .cursor();

    const [cars, orders] = await Promise.all([
      this._collectCursor(carCursor),
      this._collectCursor(orderCursor),
    ]);

    // Return null if there's absolutely nothing to process
    if (cars.length === 0 && orders.length === 0) return [];

    return { cars, orders };
  }

  // ─── TRANSFORM ────────────────────────────────────────────────────────────
  // rawData: { cars, orders } from extract()
  //
  // Inventory: re-aggregate only the modelIds that appeared in the delta.
  // Operational stats: re-aggregate from scratch (low-cost, single document).
  async transform(rawData) {
    const { cars, orders } = rawData;

    // Derive affected modelIds from changed cars
    const affectedModelIds = [...new Set(cars.map((c) => c.modelId))];

    const [inventory, operational] = await Promise.all([
      this._aggregateInventory(affectedModelIds),
      orders.length > 0 ? this._aggregateOperational() : Promise.resolve(null),
    ]);

    return { inventory, operational };
  }

  // ─── LOAD ─────────────────────────────────────────────────────────────────
  // Idempotent upserts — no deleteMany.
  async load(transformedData) {
    const { inventory, operational } = transformedData;
    let count = 0;

    if (inventory.length > 0) {
      const ops = inventory.map((i) => ({
        updateOne: {
          filter: { modelName: i.modelName }, // unique index on InventoryStats
          update: { $set: i },
          upsert: true,
        },
      }));
      await InventoryStats.bulkWrite(ops, { ordered: false });
      count += inventory.length;
    }

    if (operational) {
      // Single operational stats document keyed on 'operational'
      await OrderStats.findOneAndUpdate(
        { metric: 'operational' },
        { $set: { data: operational } },
        { upsert: true }
      );
      count += 1;
    }

    return { count };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  async _collectCursor(cursor) {
    const docs = [];
    for await (const doc of cursor) {
      docs.push(doc);
    }
    return docs;
  }

  async _aggregateInventory(affectedModelIds) {
    if (affectedModelIds.length === 0) return [];
    const now = new Date();

    return Car.aggregate([
      {
        // Only process available cars belonging to affected models
        $match: { status: 'available', modelId: { $in: affectedModelIds } },
      },
      {
        $lookup: {
          from: 'carmodels', localField: 'modelId', foreignField: '_id', as: 'model',
        },
      },
      { $unwind: '$model' },
      {
        $addFields: {
          ageDays: { $divide: [{ $subtract: [now, '$createdAt'] }, MS_PER_DAY] },
        },
      },
      {
        $group: {
          _id:          '$model.name',
          brand:        { $first: '$model.brand' },
          inStock:      { $sum: 1 },
          totalAge:     { $sum: '$ageDays' },
          bucket0_30:   { $sum: { $cond: [{ $lte: ['$ageDays', 30] }, 1, 0] } },
          bucket30_60:  { $sum: { $cond: [{ $and: [{ $gt: ['$ageDays', 30] }, { $lte: ['$ageDays', 60] }] }, 1, 0] } },
          bucket60plus: { $sum: { $cond: [{ $gt: ['$ageDays', 60] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id:                0,
          modelName:          '$_id',
          brand:              1,
          inStock:            1,
          avgDaysInInventory: { $divide: ['$totalAge', '$inStock'] },
          agingBuckets: {
            '0-30':  '$bucket0_30',
            '30-60': '$bucket30_60',
            '60+':   '$bucket60plus',
          },
        },
      },
    ]);
  }

  // Full operational stats re-computation — this is cheap (single $group over Orders)
  // and always produces exactly one document, so incremental isn't needed here.
  async _aggregateOperational() {
    const [totalOrders, cancelledOrders, distribution, processingTimeAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: 'completed', completedAt: { $exists: true } } },
        {
          $project: {
            processingTimeHours: {
              $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        { $group: { _id: null, avgTime: { $avg: '$processingTimeHours' } } },
      ]),
    ]);

    const find = (status) => distribution.find((d) => d._id === status)?.count ?? 0;

    return {
      pending:                find('pending'),
      completed:              find('completed'),
      cancelled:              find('cancelled'),
      avgProcessingTimeHours: processingTimeAgg[0]?.avgTime ?? 0,
      cancellationRate:       totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
    };
  }
}

module.exports = new InventoryPipeline();

