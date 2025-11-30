import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Correção
import { Container, Card, Form, Button, Alert, ListGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

function Turmas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [nomeTurma, setNomeTurma] = useState('');
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/turmas/'); 
      setTurmas(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao buscar turmas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'professor') {
      navigate('/dashboard');
    } else {
      fetchTurmas();
    }
  }, [user, navigate]);

  const handleCreateTurma = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormMessage('');

    if (!nomeTurma) {
      setFormError('O nome da turma é obrigatório.');
      return;
    }

    try {
      const response = await api.post('/turmas/', { nome: nomeTurma }); 
      setFormMessage(response.data.message);
      setNomeTurma(''); 
      fetchTurmas(); 
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao criar turma.');
    }
  };

  return (
    <Container className="mt-5">
      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard')} className="mb-3">
        &larr; Voltar ao Dashboard
      </Button>
      <Row>
        <Col md={7}>
          <Card>
            <Card.Header><h4>Todas as Turmas</h4></Card.Header>
            <Card.Body>
              {loading && <Spinner animation="border" />}
              {error && <Alert variant="danger">{error}</Alert>}
              
              {!loading && !error && (
                <ListGroup variant="flush">
                  {turmas.length > 0 ? (
                    turmas.map(turma => (
                      <ListGroup.Item key={turma.id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{turma.nome}</strong>
                          {turma.Professor && <small className="text-muted d-block">Prof. {turma.Professor.nome}</small>}
                        </div>
                        <Link to={`/turma/${turma.id}`}>
                          <Button variant="outline-primary" size="sm">Gerenciar Alunos</Button>
                        </Link>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <p>Nenhuma turma criada ainda.</p>
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card>
            <Card.Header><h4>Criar Nova Turma</h4></Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateTurma}>
                <Form.Group className="mb-3" controlId="formNomeTurma">
                  <Form.Label>Nome da Turma</Form.Label>
                  <Form.Control 
                    type="text"
                    placeholder="Ex: 3º Ano A - 2025"
                    value={nomeTurma}
                    onChange={(e) => setNomeTurma(e.target.value)}
                  />
                </Form.Group>
                {formMessage && <Alert variant="success">{formMessage}</Alert>}
                {formError && <Alert variant="danger">{formError}</Alert>}
                <Button variant="primary" type="submit" className="w-100">Criar Turma</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Turmas;