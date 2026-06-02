import api from './api.js';

export const getNotificacoes = async () => {
  const response = await api.get('/notificacoes');
  return response.data;
};

export const getContadorNaoLidas = async () => {
  const response = await api.get('/notificacoes/contador/nao-lidas');
  return response.data;
};

export const marcarComoLida = async (notificacaoId) => {
  const response = await api.put(`/notificacoes/${notificacaoId}/lida`);
  return response.data;
};

export const marcarTodasComoLidas = async () => {
  const response = await api.put('/notificacoes/marcar-todas/lidas');
  return response.data;
};
