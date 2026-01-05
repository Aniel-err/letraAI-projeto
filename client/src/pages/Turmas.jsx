import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Container, Card, Form, Button, Alert, ListGroup, Spinner, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

function Turmas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  
  const [nomeTurma, setNomeTurma] = useState('');
  const [temaTurma, setTemaTurma] = useState('');
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ id: '', nome: '', tema: '' });

  const fetchTurmas = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.get('/turmas/'); 
      setTurmas(response.data);
      if (!isSilent) setError('');
    } catch (err) {
      console.error(err); 
      if (!isSilent) setError(err.response?.data?.message || 'Erro ao buscar turmas.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchTurmas();
  }, [user, fetchTurmas]);

  useEffect(() => {
      if (!user) return;
      const interval = setInterval(() => fetchTurmas(true), 5000);
      return () => clearInterval(interval);
  }, [user, fetchTurmas]);

  const handleCreateTurma = async (e) => {
    e.preventDefault();
    setFormError(''); setFormMessage('');
    if (!nomeTurma || !temaTurma) return setFormError('Nome e Tema são obrigatórios.');

    try {
      await api.post('/turmas/', { nome: nomeTurma, tema: temaTurma }); 
      setFormMessage('Turma criada com sucesso!');
      setNomeTurma(''); setTemaTurma('');
      fetchTurmas(false); 
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Erro ao criar turma.');
    }
  };

  const handleUpdateTurma = async () => {
      try {
          await api.put(`/turmas/${editData.id}`, { nome: editData.nome, tema: editData.tema });
          setShowEdit(false);
          fetchTurmas(false);
          setMsg('Turma atualizada!');
      } catch (err) {
          console.error(err); 
          alert('Erro ao atualizar turma');
      }
  };

  const handleDeleteTurma = async (id) => {
      if(!window.confirm("Tem certeza?")) return;
      try {
          await api.delete(`/turmas/${id}`);
          fetchTurmas(false);
          setMsg('Turma excluída.');
      } catch (err) {
          console.error(err); 
          alert('Erro ao excluir turma');
      }
  };

  const handleSolicitar = async (turmaId) => {
    try {
        await api.post('/turmas/solicitar', { turmaId });
        setMsg('Solicitação enviada! Aguarde o professor aceitar.');
        fetchTurmas(false); 
    } catch (error) {
        console.error(error);
        setMsg('Erro: ' + (error.response?.data?.message || 'Falha ao solicitar.'));
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>&larr; Voltar</Button>
        {msg && <Alert variant="info" className="m-0 py-2 px-4">{msg}</Alert>}
      </div>

      <Row>
        <Col lg={user.role === 'professor' ? 8 : 12} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white p-3">
                <h3 className="m-0">{user.role === 'professor' ? '🏫 Minhas Turmas' : '🏫 Turmas Disponíveis'}</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {loading && <div className="text-center p-5"><Spinner animation="border" /></div>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              {!loading && !error && (
                <ListGroup variant="flush">
                  {turmas.length > 0 ? (
                    turmas.map(turma => (
                      <ListGroup.Item key={turma.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <div>
                          <h5 className="mb-1 fw-bold">{turma.nome}</h5>
                          <p className="mb-1 text-muted">📝 Tema: <strong>{turma.tema || 'Livre'}</strong></p>
                          {user.role === 'aluno' && turma.Professor && (
                              <small className="text-muted">Prof. {turma.Professor.nome}</small>
                          )}
                        </div>

                        <div>
                            {user.role === 'professor' ? (
                                <>
                                    <Link to={`/turma/${turma.id}`}>
                                        <Button variant="outline-primary" className="me-2">Alunos</Button>
                                    </Link>
                                    <Button variant="outline-warning" className="me-2" onClick={() => { setEditData(turma); setShowEdit(true); }}>✏️</Button>
                                    <Button variant="outline-danger" onClick={() => handleDeleteTurma(turma.id)}>🗑️</Button>
                                </>
                            ) : (
                                <>
                                    {turma.meuStatus === 'aprovado' && <Badge bg="success" className="p-2 fs-6">✅ Matriculado</Badge>}
                                    {turma.meuStatus === 'pendente' && <Badge bg="warning" text="dark" className="p-2 fs-6">⏳ Aguardando Aprovação</Badge>}
                                    {!turma.meuStatus && <Button variant="success" onClick={() => handleSolicitar(turma.id)}>Solicitar Entrada</Button>}
                                </>
                            )}
                        </div>
                      </ListGroup.Item>
                    ))
                  ) : <div className="text-center p-5 text-muted"><h4>Nenhuma turma encontrada.</h4></div>}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {user.role === 'professor' && (
            <Col lg={4}>
            <Card className="shadow-sm">
                <Card.Header className="bg-success text-white p-3"><h3 className="m-0">➕ Nova Turma</h3></Card.Header>
                <Card.Body className="p-4">
                <Form onSubmit={handleCreateTurma}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome da Turma</Form.Label>
                        <Form.Control size="lg" type="text" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} placeholder="Ex: 3º Ano B" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tema da Redação</Form.Label>
                        <Form.Control size="lg" type="text" value={temaTurma} onChange={(e) => setTemaTurma(e.target.value)} placeholder="Ex: O impacto da IA..." />
                    </Form.Group>
                    {formMessage && <Alert variant="success">{formMessage}</Alert>}
                    {formError && <Alert variant="danger">{formError}</Alert>}
                    <Button variant="success" size="lg" type="submit" className="w-100">Criar Turma</Button>
                </Form>
                </Card.Body>
            </Card>
            </Col>
        )}
      </Row>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
          <Modal.Header closeButton><Modal.Title>Editar Turma</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control type="text" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Tema</Form.Label>
                      <Form.Control type="text" value={editData.tema} onChange={e => setEditData({...editData, tema: e.target.value})} />
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleUpdateTurma}>Salvar</Button>
          </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Turmas;