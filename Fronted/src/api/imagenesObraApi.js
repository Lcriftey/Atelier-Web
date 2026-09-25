import httpClient from './httpClient';

const imagenesObraApi = {
  getAll: () => httpClient.get('/api/imagenes-obra'),
  create: (imagen) => httpClient.post('/api/imagenes-obra', imagen),
  remove: (id) => httpClient.delete(`/api/imagenes-obra/${id}`),
};

export default imagenesObraApi;