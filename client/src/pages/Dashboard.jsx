import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Button, Card, Alert, ListGroup, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [redacoes, setRedacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [tema, setTema] = useState('');
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const resRedacoes = await api.get('/redacoes/');
        setRedacoes(resRedacoes.data);
        setError('');
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        if(err.response && err.response.status === 401) logout();
        setError('Não foi possível carregar as informações.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, logout]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadLoading(true);
    setUploadMsg('');

    const formData = new FormData();
    formData.append('tema', tema);
    formData.append('imagem', file);

    try {
      await api.post('/redacoes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setUploadMsg('Sucesso!');
      setTema('');
      setFile(null);
      setShowUpload(false);
      
      const res = await api.get('/redacoes/');
      setRedacoes(res.data);
      
    } catch (err) {
      console.error(err);
      setUploadMsg('Erro ao enviar.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Dashboard - LetrAl</h2>
            <Button variant="danger" size="sm" onClick={handleLogout}>Sair</Button>
          </div>

          <Alert variant="info">Olá, <strong>{user?.nome}</strong> ({user?.role})</Alert>
          
          {error && <Alert variant="danger">{error}</Alert>}

          {user?.role === 'aluno' && (
            <div className="d-flex gap-3 mb-4">
              <Button variant="primary" size="lg" onClick={() => setShowUpload(true)} className="flex-grow-1">
                📤 Enviar Nova Redação
              </Button>
            </div>
          )}

          {user?.role === 'professor' && (
             <div className="d-grid gap-2 mb-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/turmas')}>
                  🏫 Gerenciar Turmas
                </Button>
             </div>
          )}

          <h4>{user?.role === 'professor' ? 'Fila de Correção' : 'Minhas Redações'}</h4>
          
          {loading ? <Spinner animation="border" /> : (
            <ListGroup>
              {redacoes.length > 0 ? redacoes.map(redacao => (
                <ListGroup.Item key={redacao.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{redacao.tema}</strong>
                    <br/>
                    <small className="text-muted">
                        {new Date(redacao.createdAt).toLocaleDateString()} 
                        {user.role === 'professor' && ` - Aluno: ${redacao.User?.nome}`}
                    </small>
                  </div>
                  <div>
                    <Badge bg={redacao.status === 'Corrigida' ? 'success' : 'warning'} className="me-2">
                        {redacao.status}
                    </Badge>
                    <Link to={`/redacao/${redacao.id}`}>
                        <Button variant="outline-primary" size="sm">
                            {user.role === 'professor' ? 'Corrigir' : 'Ver'}
                        </Button>
                    </Link>
                  </div>
                </ListGroup.Item>
              )) : <p>Nenhuma redação.</p>}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Modal show={showUpload} onHide={() => setShowUpload(false)} centered>
        <Modal.Header closeButton><Modal.Title>Enviar Redação</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleUpload}>
                <Form.Group className="mb-3">
                    <Form.Label>Tema</Form.Label>
                    <Form.Control type="text" value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: ENEM 2024" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Foto da Redação</Form.Label>
                    <Form.Control type="file" onChange={e => setFile(e.target.files[0])} accept="image/*" />
                </Form.Group>
                {uploadMsg && <p className={uploadMsg === 'Sucesso!' ? "text-success" : "text-danger"}>{uploadMsg}</p>}
                <div className="d-grid">
                    <Button type="submit" variant="success" disabled={uploadLoading}>
                        {uploadLoading ? 'Enviando...' : 'Enviar Agora'}
                    </Button>
                </div>
            </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default Dashboard;