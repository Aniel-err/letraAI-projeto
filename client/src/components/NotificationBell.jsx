import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificacoes, getContadorNaoLidas, marcarComoLida, marcarTodasComoLidas } from '../services/notificacaoService.js';

export default function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const [notificacoesData, contadorData] = await Promise.all([
        getNotificacoes(),
        getContadorNaoLidas()
      ]);
      setNotificacoes(notificacoesData);
      setNaoLidas(contadorData.naoLidas);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificacaoClick = async (notificacao) => {
    try {
      if (!notificacao.lida) {
        await marcarComoLida(notificacao.id);
        setNaoLidas(Math.max(0, naoLidas - 1));
      }
      navigate(`/redacao/${notificacao.redacaoId}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
    }
  };

  const handleMarcarComoLida = async (e, notificacao) => {
    e.stopPropagation();
    try {
      await marcarComoLida(notificacao.id);
      setNotificacoes(notificacoes.filter(n => n.id !== notificacao.id));
      if (!notificacao.lida) {
        setNaoLidas(Math.max(0, naoLidas - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      await marcarTodasComoLidas();
      setNaoLidas(0);
      await carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);

  return (
    <div className="position-relative">
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-link position-relative p-0"
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: '1.5rem',
          color: 'var(--text-color)'
        }}
        title="Notificações"
      >
        🔔
        {naoLidas > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{
              backgroundColor: '#dc3545',
              fontSize: '0.65rem',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="position-absolute shadow"
          style={{
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.375rem',
            width: '350px',
            maxHeight: '400px',
            zIndex: 1050,
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Notificações</span>
            {naoLidas > 0 && (
              <button
                onClick={handleMarcarTodasLidas}
                className="btn btn-sm btn-link p-0"
                style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando...
            </div>
          ) : notificacoesNaoLidas.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma notificação
            </div>
          ) : (
            <div>
              {notificacoesNaoLidas.map((notificacao) => (
                <div
                  key={notificacao.id}
                  style={{
                    width: '100%',
                    backgroundColor: notificacao.lida ? 'transparent' : 'rgba(0, 123, 255, 0.05)',
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = notificacao.lida
                      ? 'var(--hover-bg)'
                      : 'rgba(0, 123, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notificacao.lida
                      ? 'transparent'
                      : 'rgba(0, 123, 255, 0.05)';
                  }}
                >
                  <button
                    onClick={() => handleNotificacaoClick(notificacao)}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {!notificacao.lida && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#007bff',
                          borderRadius: '50%',
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        wordBreak: 'break-word',
                        fontWeight: notificacao.lida ? '400' : '500'
                      }}>
                        {notificacao.mensagem}
                      </p>
                      <small style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem'
                      }}>
                        {new Date(notificacao.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleMarcarComoLida(e, notificacao)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      color: 'var(--text-muted)',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--text-muted)';
                    }}
                    title="Marcar como lida"
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
