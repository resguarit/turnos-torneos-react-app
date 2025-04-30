import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://rockandgolback-production.up.railway.app/api',
  baseURL: 'http://localhost:8000/api',
  //baseURL: 'https://vps-4793092-x.dattaweb.com:8090/preview/turnos.com.ar/api',
  //baseURL: 'https://api.rgturnos.com.ar/api',
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