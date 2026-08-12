import API from './api';

export const getPayments = async (params) => {
  const res = await API.get('/payments', { params });
  return res.data.data.payments;
};

export const recordPayment = async (data) => {
  const res = await API.post('/payments', data);
  return res.data.data.payment;
};

export const getCustomerPayments = async (customerId) => {
  const res = await API.get(`/payments/customer/${customerId}`);
  return res.data.data.payments;
};

export const deletePayment = async (id) => {
  const res = await API.delete(`/payments/${id}`);
  return res.data;
};
