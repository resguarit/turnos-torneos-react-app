import axios from 'axios';

const host = window.location.host;
console.log(host);
const parts = host.split('.');
console.log(parts);
const subdomain = parts.length >= 2 ? parts[0] : null;
console.log(subdomain);

const api = axios.create({
  //baseURL: 'https://rockandgolback-production.up.railway.app/api',
  //baseURL: 'http://localhost:8000/api',
  //baseURL: 'https://vps-4793092-x.dattaweb.com:8090/preview/turnos.com.ar/api',
  baseURL: 'https://api.rgturnos.com.ar/api',
  //baseURL: 'https://7c22-191-84-231-79.ngrok-free.app/api'
});

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    if (subdomain) {
      config.headers['X-Complejo'] = subdomain;
    }
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