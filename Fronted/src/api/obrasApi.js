import httpClient from './httpClient';

const obrasApi = {
  getAll: () => httpClient.get('/api/obras'),
  getById: (id) => httpClient.get(`/api/obras/${id}`),
  create: (obra) => httpClient.post('/api/obras', obra),
  update: (id, obra) => httpClient.put(`/api/obras/${id}`, obra),
  remove: (id) => httpClient.delete(`/api/obras/${id}`),
};

export default obrasApi;