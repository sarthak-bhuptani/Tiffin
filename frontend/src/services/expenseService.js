import API from './api';

export const getExpenses = async (params) => {
  const res = await API.get('/expenses', { params });
  return res.data.data.expenses;
};

export const createExpense = async (data) => {
  const res = await API.post('/expenses', data);
  return res.data.data.expense;
};

export const updateExpense = async (id, data) => {
  const res = await API.patch(`/expenses/${id}`, data);
  return res.data.data.expense;
};

export const deleteExpense = async (id) => {
  const res = await API.delete(`/expenses/${id}`);
  return res.data;
};
