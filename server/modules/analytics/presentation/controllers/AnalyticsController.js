const getAnalyticsSummaryUseCase = require('../../application/use-cases/GetAnalyticsSummaryUseCase');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const { from, to } = req.query;
      const stats = await getAnalyticsSummaryUseCase.execute(from, to);
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) { next(err); }
  }
}

module.exports = new AnalyticsController();
