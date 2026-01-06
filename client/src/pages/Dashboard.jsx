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
  const [turmasPerdidas, setTurmasPerdidas] = useState([]); 

  const [profTurmas, setProfTurmas] = useState([]); 
  const [filtroTurma, setFiltroTurma] = useState(''); 

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
            const todasTurmas = resTurmas.data;
            const aprovadas = todasTurmas.filter(t => t.meuStatus === 'aprovado');
            
            const agora = new Date();

            const disponiveis = aprovadas.filter(t => {
                const jaEnviou = minhas.some(r => r.turmaId === t.id);
                const prazoOk = !t.prazo || new Date(t.prazo) > agora;
                return !jaEnviou && prazoOk;
            });

            const perdidas = aprovadas.filter(t => {
                const jaEnviou = minhas.some(r => r.turmaId === t.id);
                const prazoPassou = t.prazo && new Date(t.prazo) < agora;
                return !jaEnviou && prazoPassou;
            });

            setTurmasDisponiveis(disponiveis);
            setTurmasPerdidas(perdidas);

            if (aprovadas.length > 0) setStatusReal('aprovado');
            else if (todasTurmas.some(t => t.meuStatus === 'pendente')) setStatusReal('pendente');
            else setStatusReal('Sem Turma');
        } 
        else if (user.role === 'professor') {
            const resProfTurmas = await api.get('/turmas');
            setProfTurmas(resProfTurmas.data);
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
    } catch (err) { console.error(err); setUploadMsg(err.response?.data?.message || 'Erro ao enviar.'); }
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
      } catch (err) { console.error(err); setUploadMsg(err.response?.data?.message || 'Erro ao atualizar.'); }
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

  const redacoesFiltradas = redacoes.filter(r => {
      if (!filtroTurma) return true;
      return r.turmaId === Number(filtroTurma);
  });

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
                    <Button variant="primary" size="lg" className="w-100" onClick={() => setShowUpload(true)}>📤 Enviar Redação ({turmasDisponiveis.length})</Button>
                 ) : (
                    <Button variant="secondary" size="lg" className="w-100" disabled>✅ Nenhuma pendência</Button>
                 )}
              </Col>
              <Col md={6} className="mb-2">
                <Button variant="outline-primary" size="lg" className="w-100" onClick={() => navigate('/turmas')}>🏫 Ver Turmas</Button>
              </Col>
            </Row>
          )}

         
          {user?.role === 'professor' && (
             <div className="mb-4">
                <div className="d-grid gap-2 mb-3">
                    <Button variant="primary" size="lg" onClick={() => navigate('/turmas')}>🏫 Gerenciar Turmas (Alterar Prazos)</Button>
                </div>
                
                <Card className="bg-light border-0">
                    <Card.Body className="d-flex align-items-center">
                        <strong className="me-3 text-nowrap">🔍 Filtrar por Turma:</strong>
                        <Form.Select 
                            value={filtroTurma} 
                            onChange={(e) => setFiltroTurma(e.target.value)}
                            className="shadow-sm"
                        >
                            <option value="">Todas as Turmas</option>
                            {profTurmas.map(t => (
                                <option key={t.id} value={t.id}>{t.nome} - {t.tema}</option>
                            ))}
                        </Form.Select>
                    </Card.Body>
                </Card>
             </div>
          )}

          <h4 className="mt-3">{user?.role === 'professor' ? 'Fila de Correção' : 'Histórico & Prazos'}</h4>
          
          {loading ? <Spinner animation="border" /> : (
            <ListGroup variant="flush">
              
              {user.role === 'aluno' && turmasPerdidas.map(t => (
                  <ListGroup.Item key={`perdida-${t.id}`} className="d-flex justify-content-between align-items-center py-3 border-bottom bg-light">
                      <div className="text-muted">
                          <span className="fw-bold">TURMA: {t.nome} - {t.tema}</span>
                          <br/>
                          <small>Prazo encerrou em: {new Date(t.prazo).toLocaleString()}</small>
                      </div>
                      <div>
                          <Badge bg="danger" className="p-2">Nota: 0 (Prazo Expirado)</Badge>
                      </div>
                  </ListGroup.Item>
              ))}

              {redacoesFiltradas.map(r => (
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
                                />
                            ) : (
                                <div className="rounded-circle me-2 d-flex justify-content-center align-items-center bg-secondary text-white fw-bold" style={{width:'40px', height:'40px'}}>
                                    {r.User?.nome ? r.User.nome.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <strong>{r.User?.nome}</strong>
                        </div>
                    )}
                    
                    <small className="text-muted d-block mt-1">
                        Enviado: {new Date(r.createdAt).toLocaleDateString()} 
                        {r.Turma?.prazo && <span className="ms-2">(Prazo: {new Date(r.Turma.prazo).toLocaleDateString()})</span>}
                    </small>
                  </div>
                  <div>
                    {r.status === 'Corrigida' && r.notaTotal !== null && (
                        <Badge bg={r.notaTotal < 500 ? 'danger' : 'info'} className="me-2 p-2">
                            Nota: {r.notaTotal}
                        </Badge>
                    )}
                    
                    <Badge bg={r.status === 'Corrigida' ? 'success' : 'warning'} className="me-2 p-2">{r.status}</Badge>
                    <Link to={`/redacao/${r.id}`}><Button variant="outline-secondary" size="sm" className="me-2">Ver Detalhes</Button></Link>
                    
                    {user.role === 'aluno' && r.status !== 'Corrigida' && (
                        (!r.Turma?.prazo || new Date(r.Turma.prazo) > new Date()) ? (
                            <Button variant="outline-primary" size="sm" onClick={()=>abrirModalEdicao(r.id)}>✏️</Button>
                        ) : <Badge bg="secondary">Edição Fechada</Badge>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
              
              {redacoesFiltradas.length === 0 && turmasPerdidas.length === 0 && (
                  <p className="text-muted text-center mt-3">
                      {filtroTurma ? 'Nenhuma redação enviada nesta turma.' : 'Nenhuma redação encontrada.'}
                  </p>
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>


      <Modal show={showUpload} onHide={()=>setShowUpload(false)}>
        <Modal.Header closeButton><Modal.Title>Enviar</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleUpload}>
                <Form.Select onChange={e=>setSelectedTurma(e.target.value)} required>
                    <option value="">Selecione a Turma</option>
                    {turmasDisponiveis.map(t=>(
                        <option key={t.id} value={t.id}>
                            {t.nome} - (Até {t.prazo ? new Date(t.prazo).toLocaleDateString() : 'Sem prazo'})
                        </option>
                    ))}
                </Form.Select>
                
               
                <Form.Control 
                    type="file" 
                    accept="image/*"
                    className="mt-3" 
                    onChange={e=>setFile(e.target.files[0])} 
                    required 
                />
                
                {uploadMsg && <p className="text-danger mt-2">{uploadMsg}</p>}
                <Button type="submit" className="mt-3 w-100" disabled={uploadLoading}>Enviar</Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={()=>setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Reenviar</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleEdit}>
                <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={e=>setFile(e.target.files[0])} 
                    required 
                />
                {uploadMsg && <p className="text-danger mt-2">{uploadMsg}</p>}
                <Button type="submit" variant="warning" className="mt-3 w-100" disabled={uploadLoading}>Atualizar</Button>
            </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
          <Modal.Header closeButton><Modal.Title>{selectedStudentName}</Modal.Title></Modal.Header>
          <Modal.Body className="text-center bg-dark"><img src={selectedImage} alt="Aluno" style={{maxWidth:'100%', borderRadius:'4px'}}/></Modal.Body>
      </Modal>
    </Container>
  );
}

export default Dashboard;