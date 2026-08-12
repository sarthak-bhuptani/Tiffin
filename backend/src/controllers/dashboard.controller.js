const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

const getTodayDashboard = async (req, res, next) => {
  try {
    const data = await reportService.getTodayDashboard(req.query.date);
    return sendSuccess(res, 200, "Today's dashboard data fetched", data);
  } catch (error) {
    next(error);
  }
};

const getMonthlyDashboard = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = parseInt(req.query.month || new Date().getMonth() + 1, 10);
    const data = await reportService.getMonthlyReport(year, month);
    return sendSuccess(res, 200, 'Monthly dashboard overview fetched', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayDashboard,
  getMonthlyDashboard,
};
