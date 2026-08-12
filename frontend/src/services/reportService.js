import API from './api';

export const getTodayDashboard = async (date) => {
  const res = await API.get('/dashboard/today', { params: { date } });
  return res.data.data;
};

export const getMonthlyDashboard = async (year, month) => {
  const res = await API.get('/dashboard/monthly', { params: { year, month } });
  return res.data.data;
};

export const getDailyReport = async (date) => {
  const res = await API.get('/reports/daily', { params: { date } });
  return res.data.data;
};

export const getMonthlyReport = async (year, month) => {
  const res = await API.get('/reports/monthly', { params: { year, month } });
  return res.data.data;
};

export const getCustomReport = async (startDate, endDate) => {
  const res = await API.get('/reports/custom', { params: { startDate, endDate } });
  return res.data.data;
};
