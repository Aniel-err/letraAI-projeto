import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Button, Card, Alert, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [redacoes, setRedacoes] = useState([]);
  const [minhasTurmas, setMinhasTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const resRedacoes = await axios.get('http://localhost:3001/api/redacoes/');
          setRedacoes(resRedacoes.data);

          if (user.role === 'aluno') {
            const resTurmas = await axios.get('http://localhost:3001/api/turmas/');
            setMinhasTurmas(resTurmas.data);
          }

          setError('');
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao buscar dados.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Dashboard - LetrAl</h2>

          {user ? (
            <Alert variant="success">
              Bem-vindo, <strong>{user.nome}</strong>! (Cargo: {user.role})
            </Alert>
          ) : (
            <Alert variant="warning">Carregando...</Alert>
          )}

          {user && user.role === 'aluno' && (
            <>
              <Card className="my-3 p-3 bg-light">
                <h4>Enviar Redação</h4>
                <p>Envie sua redação para correção.</p>
                <Link to="/enviar-redacao">
                  <Button variant="primary">Enviar Nova Redação</Button>
                </Link>
              </Card>

              <Card className="my-3 p-3 bg-light">
                <h4>Minha Turma</h4>
                {loading ? <Spinner animation="border" size="sm" /> : (
                  <ListGroup variant="flush">
                    {minhasTurmas.length > 0 ? (
                      minhasTurmas.map(turma => (
                        <ListGroup.Item key={turma.id} className="bg-light fw-bold">
                          {turma.nome}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-muted mb-0">Você ainda não está em nenhuma turma.</p>
                    )}
                  </ListGroup>
                )}
              </Card>
            </>
          )}

          {user && user.role === 'professor' && (
            <Card className="my-3 p-3 bg-light">
              <h4>Área do Professor</h4>
              <p>Gerencie todas as turmas e alunos da escola.</p>
              <Link to="/turmas">
                <Button variant="primary">Gerenciar Turmas</Button>
              </Link>
            </Card>
          )}

          <hr />
          <h4>
            {user?.role === 'professor' ? 'Todas as Redações (Fila de Correção)' : 'Minhas Redações'}
          </h4>

          {loading && <Spinner animation="border" size="sm" />}
          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && (
            <ListGroup>
              {redacoes.length > 0 ? (
                redacoes.map(redacao => (
                  <ListGroup.Item
                    key={redacao.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>Tema:</strong> {redacao.tema}
                      <br/>
                      <small className="text-muted">
                        {user.role === 'professor' && (
                          <>
                            <span className="text-dark fw-bold">Aluno: {redacao.User.nome}</span>
                            {redacao.User.Turma ? (
                                <Badge bg="info" text="dark" className="ms-2">
                                  {redacao.User.Turma.nome}
                                </Badge>
                            ) : (
                                <Badge bg="secondary" className="ms-2">Sem Turma</Badge>
                            )}
                            <span className="mx-2">|</span>
                          </>
                        )}
                        Enviada em: {new Date(redacao.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="text-end">
                      <span
                        className={`badge bg-${redacao.status === 'Corrigida' ? 'success' : 'warning'} me-2`}
                      >
                        {redacao.status}
                      </span>
                      {redacao.status === 'Corrigida' && (
                         <span className="badge bg-dark me-2">Nota: {redacao.notaTotal}</span>
                      )}

                      <Link to={`/redacao/${redacao.id}`}>
                        <Button variant={user.role === 'professor' ? "success" : "outline-primary"} size="sm">
                          {user.role === 'professor' ? 'Corrigir' : 'Ver Detalhes'}
                        </Button>
                      </Link>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <p>Nenhuma redação encontrada.</p>
              )}
            </ListGroup>
          )}

          <Button variant="danger" onClick={handleLogout} className="w-100 mt-4">
            Sair (Logout)
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Dashboard;