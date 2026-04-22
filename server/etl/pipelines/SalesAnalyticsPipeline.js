const ETLPipeline = require('../core/ETLPipeline');
const Order = require('../../modules/order/infrastructure/models/Order');
const DailySalesSummary = require('../../modules/analytics/infrastructure/models/DailySalesSummary');
const CarModelStats = require('../../modules/analytics/infrastructure/models/CarModelStats');

class SalesAnalyticsPipeline extends ETLPipeline {
  constructor() {
    super('Sales-Analytics-Pipeline');
  }

  async extract() {
    // Extracting raw orders for aggregation
    // In a mature system, we might only extract new orders since last run
    return await Order.find({ status: 'completed' });
  }

  async transform() {
    // 1. Compute Daily Sales
    const dailyAgg = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$price" },
          ordersCount: { $sum: 1 }
        }
      },
      { 
        $project: { 
          _id: 0, 
          date: "$_id", 
          revenue: 1, 
          ordersCount: 1, 
          aov: { $divide: ["$revenue", "$ordersCount"] } 
        } 
      }
    ]);

    // 2. Compute Car Model Stats
    const modelAgg = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'cars',
          localField: 'carId',
          foreignField: '_id',
          as: 'car'
        }
      },
      { $unwind: '$car' },
      {
        $lookup: {
          from: 'carmodels',
          localField: 'car.modelId',
          foreignField: '_id',
          as: 'model'
        }
      },
      { $unwind: '$model' },
      {
        $group: {
          _id: '$model.name',
          brand: { $first: '$model.brand' },
          unitsSold: { $sum: 1 },
          revenue: { $sum: '$price' },
          totalPrice: { $sum: '$price' }
        }
      },
      { 
        $project: { 
          _id: 0,
          modelName: "$_id", 
          brand: 1, 
          unitsSold: 1, 
          revenue: 1, 
          averagePrice: { $divide: ["$totalPrice", "$unitsSold"] } 
        } 
      }
    ]);

    return { daily: dailyAgg, models: modelAgg };
  }

  async load(data) {
    const { daily, models } = data;

    // Robust Load: Upsert for daily sales to avoid downtime
    if (daily.length > 0) {
      const dailyOps = daily.map(d => ({
        updateOne: {
          filter: { date: d.date },
          update: { $set: d },
          upsert: true
        }
      }));
      await DailySalesSummary.bulkWrite(dailyOps);
    }

    // Car Model Stats: Full refresh (could be improved to upsert)
    if (models.length > 0) {
      await CarModelStats.deleteMany({});
      await CarModelStats.insertMany(models);
    }

    return { count: daily.length + models.length };
  }
}

module.exports = SalesAnalyticsPipeline;
