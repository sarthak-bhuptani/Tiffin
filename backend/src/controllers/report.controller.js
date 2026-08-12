const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

const getDailyReport = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const data = await reportService.getTodayDashboard(date);
    return sendSuccess(res, 200, 'Daily report fetched', data);
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = parseInt(req.query.month || new Date().getMonth() + 1, 10);
    const data = await reportService.getMonthlyReport(year, month);
    return sendSuccess(res, 200, 'Monthly report fetched', data);
  } catch (error) {
    next(error);
  }
};

const getCustomReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate parameters are required' });
    }
    const data = await reportService.getRangeReport(startDate, endDate);
    return sendSuccess(res, 200, 'Custom date range report fetched', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getCustomReport,
};
