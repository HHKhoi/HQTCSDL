const DailySalesSummary = require('../models/DailySalesSummary');
const CarModelStats = require('../models/CarModelStats');
const InventoryStats = require('../models/InventoryStats');
const OrderStats = require('../models/OrderStats');

class AnalyticsRepository {
  async getDailySales(from, to) {
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    return await DailySalesSummary.find(query).sort({ date: 1 });
  }

  async getCarModelStats(from, to) {
    // Currently summary table is all-time. 
    // In a real production app, this would be aggregated from Orders if from/to are present.
    return await CarModelStats.find().sort({ unitsSold: -1 });
  }

  async getInventoryStats() {
    return await InventoryStats.find().sort({ inStock: -1 });
  }

  async getOrderStats(from, to) {
    return await OrderStats.findOne({ metric: 'operational' });
  }

  // Aliases for backward compatibility or future use cases
  async getDailyAnalytics() { return this.getDailySales(); }
  async getTopModels() { return this.getCarModelStats(); }
  async getInventoryAnalytics() { return this.getInventoryStats(); }
}

module.exports = new AnalyticsRepository();
