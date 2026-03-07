import axios from 'axios';

const api = axios.create({
  // Volta a apontar explicitamente para o seu backend local
  baseURL: 'http://localhost:3001/api', 
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;