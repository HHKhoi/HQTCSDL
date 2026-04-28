const ETLPipeline = require('../core/ETLPipeline');
const Order = require('../../modules/order/infrastructure/models/Order');
const DailySalesSummary = require('../../modules/analytics/infrastructure/models/DailySalesSummary');
const CarModelStats = require('../../modules/analytics/infrastructure/models/CarModelStats');

// Aggregation date format used for daily bucketing (UTC)
const DATE_FORMAT = '%Y-%m-%d';

class SalesPipeline extends ETLPipeline {
  constructor() {
    super('sales-analytics');
  }

  // ─── EXTRACT ──────────────────────────────────────────────────────────────
  // Delta query: only orders whose updatedAt has advanced since last sync.
  // Uses a Mongoose cursor so documents are streamed one-by-one; no full-table
  // load into Node.js heap.
  //
  // Backfill mode: queries by createdAt range supplied in options.
  async extract(options) {
    let query;

    if (options.isBackfill && options.startDate && options.endDate) {
      query = {
        createdAt: {
          $gte: new Date(options.startDate),
          $lte: new Date(options.endDate),
        },
      };
    } else {
      // Standard incremental run
      query = { updatedAt: { $gt: this.syncState.lastSyncTime } };
    }

    // Project only what transform() needs — saves network bandwidth
    const cursor = Order.find(query)
      .select('_id carId price status createdAt updatedAt')
      .lean()
      .cursor();

    const records = [];
    for await (const doc of cursor) {
      records.push(doc);
    }

    return records; // [] triggers no-op warning in base class
  }

  // ─── TRANSFORM ────────────────────────────────────────────────────────────
  // rawData: array of Order documents from extract().
  //
  // Step 1 — derive the set of calendar dates that were touched by the
  //           extracted records (using createdAt, the business event date).
  // Step 2 — re-aggregate DailySalesSummary ONLY for those dates.
  //           This naturally handles late-arriving updates: an order created
  //           on Jan-01 but updated today will re-trigger a correct Jan-01 total.
  // Step 3 — re-aggregate CarModelStats for affected models.
  async transform(rawData) {
    // Derive affected date buckets (using createdAt — business event date)
    const affectedDates = [
      ...new Set(rawData.map((o) => o.createdAt.toISOString().split('T')[0])),
    ];

    // Derive affected carIds for model-level re-aggregation
    const affectedCarIds = [...new Set(rawData.map((o) => o.carId))];

    const [daily, models] = await Promise.all([
      this._aggregateDaily(affectedDates),
      this._aggregateModels(affectedCarIds),
    ]);

    return { daily, models };
  }

  // ─── LOAD ─────────────────────────────────────────────────────────────────
  // Idempotent upserts keyed on deterministic fields.
  // No deleteMany — dashboards always have data during ETL runs.
  async load(transformedData) {
    const { daily, models } = transformedData;
    let count = 0;

    if (daily.length > 0) {
      const ops = daily.map((d) => ({
        updateOne: {
          filter: { date: d.date },         // unique index on DailySalesSummary
          update: { $set: d },
          upsert: true,
        },
      }));
      await DailySalesSummary.bulkWrite(ops, { ordered: false });
      count += daily.length;
    }

    if (models.length > 0) {
      const ops = models.map((m) => ({
        updateOne: {
          filter: { modelName: m.modelName }, // unique index on CarModelStats
          update: { $set: m },
          upsert: true,
        },
      }));
      await CarModelStats.bulkWrite(ops, { ordered: false });
      count += models.length;
    }

    return { count };
  }

  // ─── Private aggregation helpers ─────────────────────────────────────────
  // Kept small and single-purpose so they are easy to test independently.

  async _aggregateDaily(affectedDates) {
    if (affectedDates.length === 0) return [];
    return Order.aggregate([
      {
        $match: {
          status: 'completed',
          $expr: {
            $in: [
              { $dateToString: { format: DATE_FORMAT, date: '$createdAt' } },
              affectedDates,
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: DATE_FORMAT, date: '$createdAt' } },
          revenue:     { $sum: '$price' },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date:        '$_id',
          revenue:     1,
          ordersCount: 1,
          aov:         { $divide: ['$revenue', '$ordersCount'] },
        },
      },
    ]);
  }

  async _aggregateModels(affectedCarIds) {
    if (affectedCarIds.length === 0) return [];
    return Order.aggregate([
      {
        // Only re-compute models linked to the cars that appeared in this delta
        $match: { status: 'completed', carId: { $in: affectedCarIds } },
      },
      {
        $lookup: {
          from:         'cars',
          localField:   'carId',
          foreignField: '_id',
          as:           'car',
        },
      },
      { $unwind: '$car' },
      {
        $lookup: {
          from:         'carmodels',
          localField:   'car.modelId',
          foreignField: '_id',
          as:           'model',
        },
      },
      { $unwind: '$model' },
      {
        $group: {
          _id:        '$model.name',
          brand:      { $first: '$model.brand' },
          unitsSold:  { $sum: 1 },
          revenue:    { $sum: '$price' },
          totalPrice: { $sum: '$price' },
        },
      },
      {
        $project: {
          _id:          0,
          modelName:    '$_id',
          brand:        1,
          unitsSold:    1,
          revenue:      1,
          averagePrice: { $divide: ['$totalPrice', '$unitsSold'] },
        },
      },
    ]);
  }
}

module.exports = new SalesPipeline();

