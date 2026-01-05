import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Button, Card, Alert, ListGroup, Spinner, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [redacoes, setRedacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusReal, setStatusReal] = useState(user?.turmaStatus || 'Sem Turma');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]); 

  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');

  const [file, setFile] = useState(null);
  const [selectedTurma, setSelectedTurma] = useState(''); 
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setLoadingStatus(true);

        const res = await api.get('/redacoes/');
        const minhas = res.data;
        setRedacoes(minhas);

        if (user.role === 'aluno') {
            const resTurmas = await api.get('/turmas');
            const aprovadas = resTurmas.data.filter(t => t.meuStatus === 'aprovado');
            const disponiveis = aprovadas.filter(t => !minhas.some(r => r.turmaId === t.id));
            setTurmasDisponiveis(disponiveis);

            if (aprovadas.length > 0) setStatusReal('aprovado');
            else if (resTurmas.data.some(t => t.meuStatus === 'pendente')) setStatusReal('pendente');
            else setStatusReal('Sem Turma');
        }
        setError('');
      } catch (err) {
        console.error(err);
        if(err.response && err.response.status === 401) { logout(); navigate('/login'); }
        else setError('Não foi possível carregar.');
      } finally { setLoading(false); setLoadingStatus(false); }
    };
    fetchData();
  }, [user, logout, navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedTurma) { setUploadMsg('Preencha tudo.'); return; }
    setUploadLoading(true); setUploadMsg('');

    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('turmaId', selectedTurma);

    try {
      await api.post('/redacoes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Enviado!'); window.location.reload(); 
    } catch (err) { console.error(err); setUploadMsg('Erro ao enviar.'); }
    finally { setUploadLoading(false); }
  };

  const handleEdit = async (e) => {
      e.preventDefault();
      if (!file) return;
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('imagem', file);
      try {
          await api.put(`/redacoes/${editId}/imagem`, formData);
          alert('Atualizado!'); window.location.reload();
      } catch (err) { console.error(err); setUploadMsg('Erro ao atualizar.'); }
      finally { setUploadLoading(false); }
  };

  const abrirModalEdicao = (id) => {
      setEditId(id);
      setFile(null);
      setUploadMsg('');
      setShowEdit(true);
  };

  const handleViewStudentImage = (avatarUrl, nome) => {
      if (!avatarUrl) return; 
      setSelectedImage(avatarUrl);
      setSelectedStudentName(nome);
      setShowImageModal(true);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Container className="mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Dashboard - LetrAl ✍️</h2>
            <Button variant="danger" size="sm" onClick={handleLogout}>Sair</Button>
          </div>

          <Alert variant="light" className="border">
            Olá, <strong>{user?.nome}</strong>!
            {user?.role === 'aluno' && (
                <div className="mt-1">Status: {loadingStatus ? <Spinner size="sm"/> : (
                    statusReal === 'aprovado' ? <Badge bg="success">Matriculado</Badge> : 
                    statusReal === 'pendente' ? <Badge bg="warning" text="dark">Pendente</Badge> :
                    <Badge bg="secondary">Sem Turma</Badge>
                )}</div>
            )}
          </Alert>
          
          {error && <Alert variant="danger">{error}</Alert>}

          {user?.role === 'aluno' && (
            <Row className="mb-4">
              <Col md={6} className="mb-2">
                 {turmasDisponiveis.length > 0 ? (
                    <Button variant="primary" size="lg" className="w-100" onClick={() => setShowUpload(true)}>📤 Enviar Redação</Button>
                 ) : (
                    <Button variant="secondary" size="lg" className="w-100" disabled>✅ Tudo enviado</Button>
                 )}
              </Col>
              <Col md={6} className="mb-2">
                <Button variant="outline-primary" size="lg" className="w-100" onClick={() => navigate('/turmas')}>🏫 Turmas</Button>
              </Col>
            </Row>
          )}

          {user?.role === 'professor' && (
             <div className="d-grid gap-2 mb-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/turmas')}>🏫 Gerenciar Turmas</Button>
             </div>
          )}

          <h4>{user?.role === 'professor' ? 'Fila de Correção' : 'Histórico de Redações'}</h4>
          
          {loading ? <Spinner animation="border" /> : (
            <ListGroup variant="flush">
              {redacoes.map(r => (
                <ListGroup.Item key={r.id} className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div>
                    <span className="fw-bold text-primary">{r.Turma ? `TURMA: ${r.Turma.nome} - ` : ''}{r.tema}</span>
                    <br/>
                    
                    {user.role === 'professor' && (
                        <div className="d-flex align-items-center mt-2">
                            {r.User?.avatar ? (
                                <img 
                                    src={r.User.avatar} 
                                    className="rounded-circle me-2 border" 
                                    width="40" height="40" 
                                    style={{objectFit:'cover', cursor: 'pointer'}}
                                    alt="avatar"
                                    onClick={() => handleViewStudentImage(r.User.avatar, r.User.nome)}
                                    title="Clique para ampliar"
                                />
                            ) : (
                                <div 
                                    className="rounded-circle me-2 d-flex justify-content-center align-items-center bg-secondary text-white fw-bold"
                                    style={{width: '40px', height: '40px', fontSize: '18px', userSelect: 'none'}}
                                >
                                    {r.User?.nome ? r.User.nome.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <strong>{r.User?.nome}</strong>
                        </div>
                    )}
                    
                    <small className="text-muted d-block mt-1">
                        {new Date(r.createdAt).toLocaleDateString()}
                        {r.editedAt && <span className="text-warning ms-2">(Editado)</span>}
                    </small>
                  </div>
                  <div>
                    {/* --- LÓGICA DE COR DA NOTA --- */}
                    {r.status === 'Corrigida' && r.notaTotal !== null && (
                        <Badge 
                            bg={r.notaTotal < 500 ? 'danger' : 'info'} 
                            className="me-2 p-2" 
                            style={{fontSize: '0.9em'}}
                        >
                            Nota: {r.notaTotal}
                        </Badge>
                    )}
                    
                    <Badge bg={r.status === 'Corrigida' ? 'success' : 'warning'} className="me-2 p-2">{r.status}</Badge>
                    <Link to={`/redacao/${r.id}`}><Button variant="outline-secondary" size="sm" className="me-2">Ver Detalhes</Button></Link>
                    {user.role === 'aluno' && r.status !== 'Corrigida' && (
                        <Button variant="outline-primary" size="sm" onClick={()=>abrirModalEdicao(r.id)}>✏️</Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
              {redacoes.length === 0 && <p className="text-muted text-center">Nenhuma redação encontrada.</p>}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Modais */}
      <Modal show={showUpload} onHide={()=>setShowUpload(false)}>
        <Modal.Header closeButton><Modal.Title>Enviar</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleUpload}>
                <Form.Select onChange={e=>setSelectedTurma(e.target.value)} required>
                    <option value="">Selecione a Turma</option>
                    {turmasDisponiveis.map(t=><option key={t.id} value={t.id}>{t.nome} - {t.tema}</option>)}
                </Form.Select>
                <Form.Control type="file" className="mt-3" onChange={e=>setFile(e.target.files[0])} required />
                {uploadMsg && <p className="text-danger mt-2">{uploadMsg}</p>}
                <Button type="submit" className="mt-3 w-100" disabled={uploadLoading}>Enviar</Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={()=>setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Reenviar</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleEdit}>
                <Form.Control type="file" onChange={e=>setFile(e.target.files[0])} required />
                {uploadMsg && <p className="text-danger mt-2">{uploadMsg}</p>}
                <Button type="submit" variant="warning" className="mt-3 w-100" disabled={uploadLoading}>Atualizar</Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
          <Modal.Header closeButton>
              <Modal.Title>Aluno: {selectedStudentName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center bg-dark">
              <img src={selectedImage} alt="Foto do Aluno" style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '4px'}} />
          </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Dashboard;