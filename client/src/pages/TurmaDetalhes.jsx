import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { Container, Card, Form, Button, Alert, ListGroup, Spinner, Row, Col } from 'react-bootstrap';

function TurmaDetalhes() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [turma, setTurma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [emailAluno, setEmailAluno] = useState('');
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const fetchTurmaDetalhes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/turmas/${id}`); 
      setTurma(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao buscar detalhes da turma.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTurmaDetalhes();
  }, [fetchTurmaDetalhes]);

  const handleAddAluno = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormMessage('');

    if (!emailAluno) {
      setFormError('O email do aluno é obrigatório.');
      return;
    }

    try {
      const response = await api.post(`/turmas/${id}/alunos`, { emailAluno }); 
      setFormMessage(response.data.message);
      setEmailAluno(''); 
      fetchTurmaDetalhes(); 
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao adicionar aluno.');
    }
  };

  const handleRemoveAluno = async (alunoId) => {
    if (window.confirm("Tem certeza que deseja remover este aluno da turma?")) {
      try {
        setFormError('');
        setFormMessage('');
        
        const response = await api.delete(`/turmas/${id}/alunos/${alunoId}`);
        
        setFormMessage(response.data.message); 
        fetchTurmaDetalhes(); 
        
      } catch (err) {
        setFormError(err.response?.data?.message || 'Erro ao remover aluno.');
      }
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-5">
      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/turmas')} className="mb-3">
        &larr; Voltar para Todas as Turmas
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}
      {formMessage && <Alert variant="success">{formMessage}</Alert>}
      {formError && <Alert variant="danger">{formError}</Alert>}
      
      {turma && (
        <Row>
          <Col md={7}>
            <Card>
              <Card.Header><h4>Alunos na Turma: {turma.nome}</h4></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {turma.Alunos && turma.Alunos.length > 0 ? (
                    turma.Alunos.map(aluno => (
                      <ListGroup.Item key={aluno.id} className="d-flex justify-content-between align-items-center">
                        {aluno.nome}
                        <Button variant="outline-danger" size="sm" onClick={() => handleRemoveAluno(aluno.id)}>
                          &#x1F5D1; Remover 
                        </Button>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <p>Nenhum aluno matriculado nesta turma.</p>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card>
              <Card.Header><h4>Adicionar Aluno</h4></Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddAluno}>
                  <Form.Group className="mb-3" controlId="formEmailAluno">
                    <Form.Label>Email do Aluno</Form.Label>
                    <Form.Control 
                      type="email"
                      placeholder="Digite o email do aluno..."
                      value={emailAluno}
                      onChange={(e) => setEmailAluno(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">Adicionar</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default TurmaDetalhes;