import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, Alert, ListGroup, Spinner, Row, Col, Modal, Badge } from 'react-bootstrap';

function TurmaDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [turma, setTurma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [emailAluno, setEmailAluno] = useState('');
    const [msg, setMsg] = useState('');

    const [showPropostaModal, setShowPropostaModal] = useState(false);
    const [showEditPropostaModal, setShowEditPropostaModal] = useState(false);
    const [novaProposta, setNovaProposta] = useState({ titulo: '', textoMotivador: '', prazo: '' });
    const [propostaEditData, setPropostaEditData] = useState({ id: '', titulo: '', textoMotivador: '', prazo: '' });

    const [showMotivadorModal, setShowMotivadorModal] = useState(false);
    const [textoMotivadorAtual, setTextoMotivadorAtual] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [propostaSelecionada, setPropostaSelecionada] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const [minhasRedacoes, setMinhasRedacoes] = useState([]);
    const [redacoesTurmaProf, setRedacoesTurmaProf] = useState([]);

    const cameraInputRef = useRef(null);
    const galeriaInputRef = useRef(null);

    const [showAlunoRedacoes, setShowAlunoRedacoes] = useState(false);
    const [alunoRedacoes, setAlunoRedacoes] = useState([]);
    const [alunoSelecionadoNome, setAlunoSelecionadoNome] = useState('');

    const formatForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    };

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

    const fetchRedacoesGerais = useCallback(async () => {
        try {
            const res = await api.get('/redacoes');
            if (user?.role === 'aluno') {
                setMinhasRedacoes(res.data.filter(r => r.userId === user.id && r.turmaId === Number(id)));
            } else if (user?.role === 'professor') {
                setRedacoesTurmaProf(res.data.filter(r => r.turmaId === Number(id)));
            }
        } catch (err) { console.error("Erro ao buscar redações:", err); }
    }, [user, id]);

    useEffect(() => {
        fetchTurmaDetalhes();
        fetchRedacoesGerais();
    }, [fetchTurmaDetalhes, fetchRedacoesGerais]);

    const handleSolicitarReenvio = async (redacaoId) => {
        try {
            await api.put(`/redacoes/${redacaoId}/solicitar-reenvio`);
            setMsg('Solicitação de reenvio enviada ao professor!');
            fetchRedacoesGerais();
        } catch { alert('Erro ao solicitar reenvio.'); }
    };

    const handleAutorizarReenvio = async (redacaoId) => {
        try {
            await api.put(`/redacoes/${redacaoId}/autorizar-reenvio`);
            setMsg('Reenvio autorizado!');
            fetchRedacoesGerais(); // Atualiza a badge amarela
            const res = await api.get('/redacoes');
            setAlunoRedacoes(res.data.filter(r => r.userId === alunoRedacoes[0]?.userId && r.turmaId === Number(id)));
        } catch { alert('Erro ao autorizar.'); }
    };

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
        } catch (err) { setMsg(err.response?.data?.message || 'Erro ao adicionar.'); }
    };

    const handleVerRedacoesAluno = (alunoId, alunoNome) => {
        const filtradas = redacoesTurmaProf.filter(r => r.userId === alunoId);
        setAlunoRedacoes(filtradas);
        setAlunoSelecionadoNome(alunoNome);
        setShowAlunoRedacoes(true);
    };

    const handleCreateProposta = async (e) => {
        e.preventDefault();
        try {
            await api.post('/propostas', { ...novaProposta, turmaId: id });
            setMsg('Proposta criada!');
            setShowPropostaModal(false);
            setNovaProposta({ titulo: '', textoMotivador: '', prazo: '' });
            fetchTurmaDetalhes();
        } catch (err) { alert(err.response?.data?.message || 'Erro ao criar proposta.'); }
    };

    const handleUpdateProposta = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/propostas/${propostaEditData.id}`, {
                titulo: propostaEditData.titulo,
                textoMotivador: propostaEditData.textoMotivador,
                prazo: propostaEditData.prazo || null
            });
            setMsg('Proposta atualizada!');
            setShowEditPropostaModal(false);
            fetchTurmaDetalhes();
        } catch (err) { alert(err.response?.data?.message || 'Erro ao atualizar.'); }
    };

    const handleDeleteProposta = async (propostaId) => {
        if (!window.confirm("Deseja apagar?")) return;
        try {
            await api.delete(`/propostas/${propostaId}`);
            setMsg('Proposta apagada.');
            fetchTurmaDetalhes();
        } catch (err) {
            console.error(err);
            alert('Erro ao apagar.');
        }
    };

    const handleDeleteMinhaRedacao = async (redacaoId) => {
        if (!window.confirm("Excluir redação?")) return;
        try {
            await api.delete(`/redacoes/${redacaoId}`);
            setMsg('Redação excluída!');
            fetchRedacoesGerais();
        } catch { alert('Erro ao excluir.'); }
    };

    const handleUploadRedacao = async (e) => {
        e.preventDefault();
        if (!file) return alert('Selecione a imagem.');
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('imagem', file);
        formData.append('turmaId', id);
        formData.append('propostaId', propostaSelecionada);

        try {
            const envioExistente = minhasRedacoes.find(r => r.propostaId === propostaSelecionada);
            if (envioExistente) {
                await api.put(`/redacoes/${envioExistente.id}/imagem`, formData);
                setMsg('Redação atualizada!');
            } else {
                await api.post('/redacoes/upload', formData);
                setMsg('Redação enviada!');
            }
            setShowUploadModal(false);
            setFile(null);
            fetchRedacoesGerais();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro no envio.');
        } finally { setUploadLoading(false); }
    };

    if (loading && !turma) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

    const pendentes = turma?.Alunos?.filter(a => a.turmaStatus === 'pendente') || [];
    const aprovados = turma?.Alunos?.filter(a => a.turmaStatus === 'aprovado') || [];

    const AvatarAluno = ({ src }) => (
        <img src={src || 'https://via.placeholder.com/40?text=?'} alt="Perfil" className="rounded-circle me-3 border" width="40" height="40" style={{ objectFit: 'cover' }} />
    );

    return (
        <Container className="mt-4">
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/turmas')} className="mb-3 fw-bold">
                &larr; Voltar para Turmas
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}
            {msg && <Alert variant="success" onClose={() => setMsg('')} dismissible>{msg}</Alert>}

            {turma && (
                <Row>
                    <Col md={12}>
                        <h2 className="mb-4 text-primary fw-bold">🏫 Turma: {turma.nome}</h2>
                    </Col>

                    <Col md={12} className="mb-4">
                        <Card className="shadow-sm border-info bg-body">
                            <Card.Header className="bg-info text-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 p-3">
                                <h5 className="m-0 fw-bold">📚 Propostas de Redação</h5>
                                {user?.role === 'professor' && (
                                    <Button variant="light" size="sm" className="fw-bold text-info w-100 w-sm-auto" onClick={() => setShowPropostaModal(true)}>
                                        ➕ Adicionar Proposta
                                    </Button>
                                )}
                            </Card.Header>
                            <ListGroup variant="flush">
                                {turma.Propostas && turma.Propostas.length > 0 ? (
                                    turma.Propostas.map(p => {
                                        const isExpired = p.prazo && new Date(p.prazo) < new Date();
                                        const redacaoEnviada = minhasRedacoes.find(r => r.propostaId === p.id);

                                        return (
                                            <ListGroup.Item key={p.id} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-3 gap-3 bg-body text-body">
                                                <div className="w-100">
                                                    <h5 className="mb-1 text-primary fw-bold">{p.titulo}</h5>
                                                    {p.prazo ? (
                                                        <p className="mb-0 text-body-secondary">
                                                            ⏳ Prazo: <strong>{new Date(p.prazo).toLocaleString()}</strong>
                                                            {isExpired && <Badge bg="danger" className="ms-2">Encerrado</Badge>}
                                                        </p>
                                                    ) : <p className="mb-0 text-success fw-bold">⏳ Sem prazo de entrega</p>}
                                                    {redacaoEnviada && <Badge bg="info" className="mt-2 p-2">Status do seu envio: {redacaoEnviada.status}</Badge>}
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 w-100 justify-content-md-end">
                                                    <Button variant="primary" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => {
                                                        setTextoMotivadorAtual(p.textoMotivador || 'Nenhum texto de apoio foi adicionado.');
                                                        setShowMotivadorModal(true);
                                                    }}>📖 Ler Proposta</Button>

                                                    {user?.role === 'aluno' && (
                                                        <>
                                                            {!redacaoEnviada && isExpired && (
                                                                <Button variant="secondary" size="sm" className="fw-bold flex-fill flex-md-grow-0" disabled>⛔ Prazo Encerrado</Button>
                                                            )}
                                                            {!redacaoEnviada && !isExpired && (
                                                                <Button variant="success" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => {
                                                                    setPropostaSelecionada(p.id);
                                                                    setShowUploadModal(true);
                                                                }}>📤 Enviar</Button>
                                                            )}
                                                            {redacaoEnviada?.status === 'Corrigida' && (
                                                                <Button variant="outline-warning" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => handleSolicitarReenvio(redacaoEnviada.id)}>✏️ Solicitar Reenvio</Button>
                                                            )}
                                                            {(redacaoEnviada?.status === 'Enviada' || redacaoEnviada?.status === 'Reenvio Autorizado') && (
                                                                <>
                                                                    <Button variant="warning" size="sm" className="fw-bold text-dark flex-fill flex-md-grow-0" onClick={() => {
                                                                        setPropostaSelecionada(p.id);
                                                                        setShowUploadModal(true);
                                                                    }}>✏️ {redacaoEnviada.status === 'Enviada' ? 'Editar' : 'Reenviar'}</Button>
                                                                    <Button variant="outline-danger" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => handleDeleteMinhaRedacao(redacaoEnviada.id)}>🗑️ Excluir</Button>
                                                                </>
                                                            )}
                                                            {redacaoEnviada?.status === 'Solicitado Reenvio' && (
                                                                <Button variant="secondary" size="sm" className="fw-bold flex-fill flex-md-grow-0" disabled>⏳ Aguardando Prof.</Button>
                                                            )}
                                                        </>
                                                    )}

                                                    {user?.role === 'professor' && (
                                                        <>
                                                            <Button variant="outline-warning" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => {
                                                                setPropostaEditData({
                                                                    id: p.id, titulo: p.titulo, textoMotivador: p.textoMotivador, prazo: formatForInput(p.prazo)
                                                                });
                                                                setShowEditPropostaModal(true);
                                                            }}>✏️ Editar</Button>
                                                            <Button variant="outline-danger" size="sm" className="fw-bold flex-fill flex-md-grow-0" onClick={() => handleDeleteProposta(p.id)}>🗑️ Apagar</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </ListGroup.Item>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted text-center p-4 m-0">Nenhuma proposta de redação cadastrada ainda.</p>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>

                    {user?.role === 'professor' && (
                        <>
                            <Col md={8}>
                                {pendentes.length > 0 && (
                                    <Card className="mb-4 border-warning shadow-sm">
                                        <Card.Header className="bg-warning text-dark fw-bold">
                                            ⏳ Solicitações Pendentes ({pendentes.length})
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {pendentes.map(aluno => (
                                                <ListGroup.Item key={aluno.id} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-2 bg-body text-body">
                                                    <div className="d-flex align-items-center mb-2 mb-sm-0">
                                                        <AvatarAluno src={aluno.avatar} />
                                                        <span>{aluno.nome} <br className="d-block d-sm-none" /><small className="text-muted">({aluno.email})</small></span>
                                                    </div>
                                                    <div className="d-flex gap-2 w-100 justify-content-sm-end">
                                                        <Button variant="success" className="flex-fill flex-sm-grow-0 fw-bold" onClick={() => handleProcessarSolicitacao(aluno.id, 'aprovar')}>✅ Aceitar</Button>
                                                        <Button variant="danger" className="flex-fill flex-sm-grow-0 fw-bold" onClick={() => handleProcessarSolicitacao(aluno.id, 'rejeitar')}>❌ Recusar</Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card>
                                )}

                                <Card className="shadow-sm mb-4">
                                    <Card.Header className="bg-primary text-white fw-bold">👥 Alunos Matriculados</Card.Header>
                                    <Card.Body className="p-0">
                                        <ListGroup variant="flush">
                                            {aprovados.length > 0 ? (
                                                aprovados.map(aluno => {
                                                    const redacoesDoAluno = redacoesTurmaProf.filter(r => r.userId === aluno.id);
                                                    const temReenvioPendente = redacoesDoAluno.some(r => r.status === 'Solicitado Reenvio');

                                                    return (
                                                        <ListGroup.Item key={aluno.id} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-2 bg-body text-body">
                                                            <div className="d-flex align-items-center mb-2 mb-sm-0">
                                                                <AvatarAluno src={aluno.avatar} />
                                                                <span className="fw-semibold me-2">{aluno.nome}</span>
                                                                {temReenvioPendente && <Badge bg="warning" text="dark" className="fs-6 animation-pulse shadow-sm">⚠️ Solicitou Reenvio</Badge>}
                                                            </div>
                                                            <div className="d-flex gap-2 w-100 justify-content-sm-end">
                                                                <Button variant={temReenvioPendente ? "warning" : "outline-primary"} className="flex-fill flex-sm-grow-0 fw-bold" onClick={() => handleVerRedacoesAluno(aluno.id, aluno.nome)}>
                                                                    👁️ Ver Redações
                                                                </Button>
                                                                <Button variant="outline-danger" className="flex-fill flex-sm-grow-0 fw-bold" onClick={() => handleProcessarSolicitacao(aluno.id, 'rejeitar')}>
                                                                    🗑️ Remover
                                                                </Button>
                                                            </div>
                                                        </ListGroup.Item>
                                                    );
                                                })
                                            ) : <p className="text-muted text-center p-4 m-0">Nenhum aluno nesta turma.</p>}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="shadow-sm border-0 bg-body text-body">
                                    <Card.Header className="fw-bold">➕ Adicionar Aluno (Manual)</Card.Header>
                                    <Card.Body>
                                        <Form onSubmit={handleAddManual}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email do Aluno</Form.Label>
                                                <Form.Control type="email" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} placeholder="aluno@acad.ifma.edu.br" />
                                            </Form.Group>
                                            <Button variant="success" type="submit" className="w-100 fw-bold">Adicionar</Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </>
                    )}
                </Row>
            )}

            <Modal show={showPropostaModal} onHide={() => setShowPropostaModal(false)} size="lg">
                <Modal.Header closeButton><Modal.Title className="fw-bold">Criar Nova Proposta</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateProposta}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título da Proposta</Form.Label>
                            <Form.Control type="text" required placeholder="Ex: Os desafios da IA no Brasil" value={novaProposta.titulo} onChange={e => setNovaProposta({ ...novaProposta, titulo: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Texto Motivador (Instruções e Apoio)</Form.Label>
                            <Form.Control as="textarea" rows={6} placeholder="Cole aqui os textos motivadores para o aluno ler..." value={novaProposta.textoMotivador} onChange={e => setNovaProposta({ ...novaProposta, textoMotivador: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Prazo Final de Entrega (Opcional)</Form.Label>
                            <Form.Control type="datetime-local" value={novaProposta.prazo} onChange={e => setNovaProposta({ ...novaProposta, prazo: e.target.value })} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 fw-bold">Salvar Proposta</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEditPropostaModal} onHide={() => setShowEditPropostaModal(false)} size="lg">
                <Modal.Header closeButton><Modal.Title className="fw-bold">Editar Proposta</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateProposta}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título da Proposta</Form.Label>
                            <Form.Control type="text" required value={propostaEditData.titulo} onChange={e => setPropostaEditData({ ...propostaEditData, titulo: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Texto Motivador</Form.Label>
                            <Form.Control as="textarea" rows={6} value={propostaEditData.textoMotivador} onChange={e => setPropostaEditData({ ...propostaEditData, textoMotivador: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Prazo Final de Entrega</Form.Label>
                            <Form.Control type="datetime-local" value={propostaEditData.prazo} onChange={e => setPropostaEditData({ ...propostaEditData, prazo: e.target.value })} />
                            <Form.Text className="text-muted">Para reabrir o envio, escolha uma data futura.</Form.Text>
                        </Form.Group>
                        <Button variant="warning" type="submit" className="w-100 fw-bold">Atualizar Proposta</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showMotivadorModal} onHide={() => setShowMotivadorModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-body-tertiary"><Modal.Title className="fw-bold">📖 Texto Motivador</Modal.Title></Modal.Header>
                <Modal.Body className="text-body" style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
                    {textoMotivadorAtual}
                </Modal.Body>
            </Modal>

            <Modal show={showUploadModal} onHide={() => { setShowUploadModal(false); setFile(null); }}>
                <Modal.Header closeButton className="bg-body-tertiary"><Modal.Title className="fw-bold">📤 Enviar Redação</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUploadRedacao}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold d-block text-center mb-3">Como deseja enviar a sua redação?</Form.Label>

                            <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                                <Button variant="outline-primary" className="flex-fill py-3 fw-bold" onClick={() => cameraInputRef.current?.click()}>
                                    📸 Tirar Foto Agora
                                </Button>
                                <Button variant="outline-secondary" className="flex-fill py-3 fw-bold" onClick={() => galeriaInputRef.current?.click()}>
                                    📂 Escolher Arquivo
                                </Button>
                            </div>

                            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                            <input type="file" accept="image/*" ref={galeriaInputRef} style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />

                            {file && (
                                <Alert variant="success" className="text-center">
                                    ✅ Arquivo anexado: <br /><strong>{file.name}</strong>
                                </Alert>
                            )}
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100 py-2 fw-bold" disabled={uploadLoading || !file}>
                            {uploadLoading ? <Spinner size="sm" /> : 'Confirmar Envio'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showAlunoRedacoes} onHide={() => setShowAlunoRedacoes(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold">Redações: {alunoSelecionadoNome}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-body">
                    {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                        <ListGroup>
                            {alunoRedacoes.length > 0 ? alunoRedacoes.map(r => (
                                <ListGroup.Item key={r.id} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-3 gap-3 bg-body text-body">
                                    <div className="w-100">
                                        <strong className="d-block fs-5">{r.Proposta ? r.Proposta.titulo : 'Sem Proposta Vinculada'}</strong>
                                        <small className="text-muted d-block mt-1">Enviado em: {new Date(r.createdAt).toLocaleDateString()}</small>
                                        <Badge bg={r.status === 'Corrigida' ? 'success' : 'warning'} text={r.status === 'Corrigida' ? 'light' : 'dark'} className="mt-2">{r.status}</Badge>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {r.status === 'Solicitado Reenvio' && <Button variant="success" size="sm" onClick={() => handleAutorizarReenvio(r.id)}>✅ Autorizar</Button>}
                                        <Link to={`/redacao/${r.id}`} className="w-100 w-md-auto text-decoration-none">
                                            <Button variant="outline-primary" className="w-100 fw-bold">📝 Corrigir / Ver Nota</Button>
                                        </Link>
                                    </div>
                                </ListGroup.Item>
                            )) : <p className="text-center text-muted m-0 p-4">O aluno ainda não enviou redações nesta turma.</p>}
                        </ListGroup>
                    )}
                </Modal.Body>
            </Modal>

        </Container>
    );
}

export default TurmaDetalhes;