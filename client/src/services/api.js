import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('Atenção: Nenhum token encontrado no localStorage!');
  }
  
  return config;
});

export default api;