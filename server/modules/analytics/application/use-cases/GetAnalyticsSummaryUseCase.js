const analyticsRepo = require('../../infrastructure/repositories/AnalyticsRepository');

class GetAnalyticsSummaryUseCase {
  async execute(from, to) {
    const [dailySales, carModelStats, inventoryStats, orderStats] = await Promise.all([
      analyticsRepo.getDailySales(from, to),
      analyticsRepo.getCarModelStats(from, to),
      analyticsRepo.getInventoryStats(),
      analyticsRepo.getOrderStats(from, to)
    ]);

    return {
      dailySales,
      carModelStats,
      inventoryStats,
      orderStats: orderStats?.data || {}
    };
  }
}

module.exports = new GetAnalyticsSummaryUseCase();
