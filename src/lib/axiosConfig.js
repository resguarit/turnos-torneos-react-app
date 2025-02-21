import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'http://127.0.0.1:8000/api', // Cambia esto a la URL de tu API
=======
  //baseURL: 'https://rockandgolback-production.up.railway.app/api',
  baseURL: 'http://127.0.0.1:8000/api',
>>>>>>> 994b4d79a5ae47e86a68b7ec76f8284992ed974e
});

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.signal) {
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;