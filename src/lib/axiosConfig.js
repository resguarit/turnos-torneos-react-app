import axios from 'axios';

const host = window.location.host;
console.log(host);
const parts = host.split('.');
console.log(parts);
const subdomain = parts.length >= 2 ? parts[0] : null;
console.log(subdomain);

const api = axios.create({
  //baseURL: 'http://localhost:8000/api',
  //baseURL: 'https://api.rgturnos.com.ar/api',
  baseURL: 'https://api.complejorockandgol.com.ar/api',
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