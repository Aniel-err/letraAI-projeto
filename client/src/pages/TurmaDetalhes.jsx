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
  const [msg, setMsg] = useState('');

  const fetchTurmaDetalhes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/turmas/${id}`);
      setTurma(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao buscar turma.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTurmaDetalhes(); }, [fetchTurmaDetalhes]);

  const handleProcessarSolicitacao = async (alunoId, acao) => {
    try {
        await api.post('/turmas/aprovar', { alunoId, acao, turmaId: id });
        setMsg(acao === 'aprovar' ? 'Aluno aprovado!' : 'Solicitação rejeitada.');
        fetchTurmaDetalhes(); 
    } catch (err) { console.error(err); setMsg('Erro ao processar.'); }
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!emailAluno) return;
    try {
      const response = await api.post(`/turmas/${id}/alunos`, { email: emailAluno });
      setMsg(response.data.message);
      setEmailAluno(''); 
      fetchTurmaDetalhes(); 
    } catch (err) { console.error(err); setMsg(err.response?.data?.message || 'Erro ao adicionar.'); }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  const pendentes = turma?.Alunos?.filter(a => a.turmaStatus === 'pendente') || [];
  const aprovados = turma?.Alunos?.filter(a => a.turmaStatus === 'aprovado') || [];

  const AvatarAluno = ({ src }) => (
      <img 
        src={src || 'https://via.placeholder.com/40?text=?'} 
        alt="Perfil"
        className="rounded-circle me-3 border"
        width="40" height="40"
        style={{ objectFit: 'cover' }}
      />
  );

  return (
    <Container className="mt-5">
      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/turmas')} className="mb-3">
        &larr; Voltar
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}
      {msg && <Alert variant="info" onClose={() => setMsg('')} dismissible>{msg}</Alert>}
      
      {turma && (
        <Row>
          <Col md={8}>
            <h2 className="mb-4">Turma: {turma.nome}</h2>

            {/* Pendentes */}
            {pendentes.length > 0 && (
                <Card className="mb-4 border-warning shadow-sm">
                    <Card.Header className="bg-warning text-dark fw-bold">
                        ⏳ Solicitações ({pendentes.length})
                    </Card.Header>
                    <ListGroup variant="flush">
                        {pendentes.map(aluno => (
                            <ListGroup.Item key={aluno.id} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <AvatarAluno src={aluno.avatar} />
                                    <span>{aluno.nome} <small className="text-muted">({aluno.email})</small></span>
                                </div>
                                <div>
                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleProcessarSolicitacao(aluno.id, 'aprovar')}>Aceitar</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleProcessarSolicitacao(aluno.id, 'rejeitar')}>Recusar</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            )}

            {/* Matriculados */}
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">👥 Alunos Matriculados</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {aprovados.length > 0 ? (
                    aprovados.map(aluno => (
                      <ListGroup.Item key={aluno.id} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <AvatarAluno src={aluno.avatar} />
                            <span>{aluno.nome}</span>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={() => handleProcessarSolicitacao(aluno.id, 'rejeitar')}>Remover</Button>
                      </ListGroup.Item>
                    ))
                  ) : <p className="text-muted m-0">Nenhum aluno nesta turma.</p>}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Adicionar */}
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Header>➕ Adicionar Aluno</Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddManual}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email do Aluno</Form.Label>
                    <Form.Control type="email" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} />
                  </Form.Group>
                  <Button variant="success" type="submit" className="w-100">Adicionar</Button>
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