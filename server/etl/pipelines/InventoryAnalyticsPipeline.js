const ETLPipeline = require('../core/ETLPipeline');
const Car = require('../../modules/car/infrastructure/models/Car');
const Order = require('../../modules/order/infrastructure/models/Order');
const InventoryStats = require('../../modules/analytics/infrastructure/models/InventoryStats');
const OrderStats = require('../../modules/analytics/infrastructure/models/OrderStats');

class InventoryAnalyticsPipeline extends ETLPipeline {
  constructor() {
    super('Inventory-Analytics-Pipeline');
  }

  async extract() {
    // Extracting available cars and all orders
    return {
      availableCars: await Car.find({ status: 'available' }),
      allOrders: await Order.find()
    };
  }

  async transform() {
    // 1. Inventory Stats & Aging
    const inventoryAgg = await Car.aggregate([
      { $match: { status: 'available' } },
      {
        $lookup: {
          from: 'carmodels',
          localField: 'modelId',
          foreignField: '_id',
          as: 'model'
        }
      },
      { $unwind: '$model' },
      {
        $addFields: {
          ageDays: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: '$model.name',
          brand: { $first: '$model.brand' },
          inStock: { $sum: 1 },
          totalAge: { $sum: '$ageDays' },
          bucket0_30: { $sum: { $cond: [{ $lte: ["$ageDays", 30] }, 1, 0] } },
          bucket30_60: { $sum: { $cond: [{ $and: [{ $gt: ["$ageDays", 30] }, { $lte: ["$ageDays", 60] }] }, 1, 0] } },
          bucket60plus: { $sum: { $cond: [{ $gt: ["$ageDays", 60] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          modelName: "$_id",
          brand: 1,
          inStock: 1,
          avgDaysInInventory: { $divide: ["$totalAge", "$inStock"] },
          agingBuckets: {
            '0-30': "$bucket0_30",
            '30-60': "$bucket30_60",
            '60+': "$bucket60plus"
          }
        }
      }
    ]);

    // 2. Order Stats & Operational Metrics
    const totalOrders = await Order.countDocuments();
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    const distribution = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const processingTimeAgg = await Order.aggregate([
      { $match: { status: 'completed', completedAt: { $exists: true } } },
      {
        $project: {
          processingTimeHours: {
            $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60]
          }
        }
      },
      { $group: { _id: null, avgTime: { $avg: "$processingTimeHours" } } }
    ]);

    const stats = {
      pending: distribution.find(d => d._id === 'pending')?.count || 0,
      completed: distribution.find(d => d._id === 'completed')?.count || 0,
      cancelled: distribution.find(d => d._id === 'cancelled')?.count || 0,
      avgProcessingTimeHours: processingTimeAgg[0]?.avgTime || 0,
      cancellationRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0
    };

    return { inventory: inventoryAgg, operational: stats };
  }

  async load(data) {
    const { inventory, operational } = data;

    if (inventory.length > 0) {
      await InventoryStats.deleteMany({});
      await InventoryStats.insertMany(inventory);
    }

    await OrderStats.deleteMany({});
    await OrderStats.create({ metric: 'operational', data: operational });

    return { count: inventory.length + 1 };
  }
}

module.exports = InventoryAnalyticsPipeline;
