import axios from 'axios';

// Crear una instancia de Axios
const api = axios.create({
  baseURL: 'https://rockandgolback-production.up.railway.app/api', // Cambia esto a la URL de tu API
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