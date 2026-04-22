const Car = require('../../modules/car/infrastructure/models/Car');
const Order = require('../../modules/order/infrastructure/models/Order');
const InventoryStats = require('../../modules/analytics/infrastructure/models/InventoryStats');
const OrderStats = require('../../modules/analytics/infrastructure/models/OrderStats');

module.exports = {
  name: 'inventory-analytics',
  
  extract: async () => null,

  transform: async () => {
    const inventory = await Car.aggregate([
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

    return { inventory, stats };
  },

  load: async (data) => {
    const { inventory, stats } = data;

    if (inventory.length > 0) {
      const inventoryOps = inventory.map(i => ({
        updateOne: {
          filter: { modelName: i.modelName },
          update: { $set: i },
          upsert: true
        }
      }));
      await InventoryStats.bulkWrite(inventoryOps);
    }

    await OrderStats.findOneAndUpdate(
      { metric: 'operational' },
      { $set: { data: stats } },
      { upsert: true }
    );

    return inventory.length + 1;
  }
};
