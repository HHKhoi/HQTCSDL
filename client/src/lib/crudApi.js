import api from './axios';

export const createCrudApi = (endpoint) => ({
  getAll: () => api.get(endpoint).then(res => res.data.data.doc),
  getOne: (id) => api.get(`${endpoint}/${id}`).then(res => res.data.data.doc),
  create: (data) => api.post(endpoint, data).then(res => res.data.data.doc),
  update: (id, data) => api.patch(`${endpoint}/${id}`, data).then(res => res.data.data.doc),
  delete: (id) => api.delete(`${endpoint}/${id}`)
});

export const apiCarTypes = createCrudApi('/car-types');
export const apiCarModels = createCrudApi('/car-models');
export const apiCarSpecs = createCrudApi('/car-specs');
export const apiCars = createCrudApi('/cars');
export const apiOrders = createCrudApi('/orders');
