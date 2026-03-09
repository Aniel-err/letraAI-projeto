import axios from 'axios';

// MUDANÇA: Usa a variável de ambiente se existir, senão usa o link local de teste
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api', 
  headers: {
    'ngrok-skip-browser-warning': 'true' 
  }
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;