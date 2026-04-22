const analyticsRepo = require('../../infrastructure/repositories/AnalyticsRepository');

class GetDashboardStatsUseCase {
  async execute() {
    const [daily, topModels, inventory] = await Promise.all([
      analyticsRepo.getDailyAnalytics(),
      analyticsRepo.getTopModels(),
      analyticsRepo.getInventoryAnalytics()
    ]);
    
    return {
      dailySales: daily,
      carModelStats: topModels,
      inventoryStats: inventory
    };
  }
}

module.exports = new GetDashboardStatsUseCase();
