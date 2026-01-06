import axios from 'axios';

const api = axios.create({
  baseURL: 'http://69.62.97.146:3001/api', 
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;