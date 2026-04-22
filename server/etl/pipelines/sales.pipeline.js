const Order = require('../../modules/order/infrastructure/models/Order');
const DailySalesSummary = require('../../modules/analytics/infrastructure/models/DailySalesSummary');
const CarModelStats = require('../../modules/analytics/infrastructure/models/CarModelStats');

module.exports = {
  name: 'sales-analytics',
  
  extract: async () => {
    // We aggregate directly in MongoDB for efficiency
    return null; 
  },

  transform: async () => {
    const daily = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$price" },
          ordersCount: { $sum: 1 }
        }
      },
      { $project: { _id: 0, date: "$_id", revenue: 1, ordersCount: 1, aov: { $divide: ["$revenue", "$ordersCount"] } } }
    ]);

    const models = await Order.aggregate([
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

    return { daily, models };
  },

  load: async (data) => {
    const { daily, models } = data;
    let count = 0;

    if (daily.length > 0) {
      const ops = daily.map(d => ({
        updateOne: {
          filter: { date: d.date },
          update: { $set: d },
          upsert: true
        }
      }));
      await DailySalesSummary.bulkWrite(ops);
      count += daily.length;
    }

    if (models.length > 0) {
      const modelOps = models.map(m => ({
        updateOne: {
          filter: { modelName: m.modelName },
          update: { $set: m },
          upsert: true
        }
      }));
      await CarModelStats.bulkWrite(modelOps);
      count += models.length;
    }

    return count;
  }
};
