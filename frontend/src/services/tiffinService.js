import API from './api';

export const getTiffins = async (params) => {
  const res = await API.get('/tiffins', { params });
  return res.data.data.tiffins;
};

export const createSingleTiffin = async (data) => {
  const res = await API.post('/tiffins', data);
  return res.data.data.tiffin;
};

export const createBulkTiffins = async (date, entries) => {
  const res = await API.post('/tiffins/bulk', { date, entries });
  return res.data.data;
};

export const updateTiffin = async (id, data) => {
  const res = await API.patch(`/tiffins/${id}`, data);
  return res.data.data.tiffin;
};

export const deleteTiffin = async (id) => {
  const res = await API.delete(`/tiffins/${id}`);
  return res.data;
};
