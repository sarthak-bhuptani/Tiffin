import API from './api';

export const getCustomers = async (params) => {
  const res = await API.get('/customers', { params });
  return res.data.data.customers;
};

export const getCustomerById = async (id) => {
  const res = await API.get(`/customers/${id}`);
  return res.data.data;
};

export const createCustomer = async (data) => {
  const res = await API.post('/customers', data);
  return res.data.data.customer;
};

export const updateCustomer = async (id, data) => {
  const res = await API.patch(`/customers/${id}`, data);
  return res.data.data.customer;
};

export const deleteCustomer = async (id) => {
  const res = await API.delete(`/customers/${id}`);
  return res.data.data;
};
