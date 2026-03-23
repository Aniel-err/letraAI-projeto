import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Button, Card, Alert, ListGroup, Spinner, Badge, Modal, Row, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [redacoes, setRedacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [redacaoEditando, setRedacaoEditando] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const cameraEditRef = useRef(null);
    const galeriaEditRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const fetchRedacoes = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/redacoes/');
            setRedacoes(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) { logout(); navigate('/login'); }
            else setError('Não foi possível carregar os dados recentes.');
        } finally { setLoading(false); }
    }, [user, logout, navigate]);

    useEffect(() => {
        fetchRedacoes();
    }, [fetchRedacoes]);

    const abrirModalEdicao = (id) => {
        setRedacaoEditando(id);
        setEditFile(null);
        setShowEditModal(true);
    };

    const handleAutorizarReenvio = async (redacaoId) => {
        try {
            await api.put(`/redacoes/${redacaoId}/autorizar-reenvio`);
            setSuccessMsg('Reenvio autorizado com sucesso!');
            fetchRedacoes();

            setTimeout(() => setSuccessMsg(''), 4000);
        } catch {
            setError('Erro ao autorizar reenvio.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleReenviarRedacao = async (e) => {
        e.preventDefault();
        if (!editFile) return alert("Por favor, selecione a nova imagem da redação.");

        setEditLoading(true);
        const formData = new FormData();
        formData.append('imagem', editFile);

        try {
            await api.put(`/redacoes/${redacaoEditando}/imagem`, formData);

            setSuccessMsg("✅ Redação reenviada com sucesso!");
            setShowEditModal(false);
            setEditFile(null);
            fetchRedacoes();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            console.error("Erro ao reenviar redação:", err);
            setError(err.response?.data?.message || "Erro ao reenviar a redação. Verifique a API.");
            setTimeout(() => setError(''), 4000);
        } finally {
            setEditLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <Container className="mt-5">
            <Card className="shadow-sm border-0 bg-body">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0 fw-bold text-primary">Dashboard - LetrAI ✍️</h2>
                        <Button variant="danger" size="sm" className="fw-bold" onClick={handleLogout}>Sair</Button>
                    </div>

                    <Alert variant="info" className="shadow-sm text-body">
                        Olá, <strong>{user?.nome}</strong>!
                        {user?.role === 'aluno' && <span className="ms-2">- Acompanhe seus resultados abaixo.</span>}
                    </Alert>

                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}

                    <Row className="mb-4">
                        {user?.role === 'aluno' && (
                            <Col md={12} className="mb-2">
                                <Button variant="primary" className="w-100 fw-bold shadow-sm" onClick={() => navigate('/turmas')}>
                                    🏫 Acessar Turmas para Enviar Redações
                                </Button>
                            </Col>
                        )}

                        {user?.role === 'professor' && (
                            <Col md={12}>
                                <Button variant="primary" className="w-100 fw-bold shadow-sm" onClick={() => navigate('/turmas')}>
                                    🏫 Gerenciar Turmas e Propostas
                                </Button>
                            </Col>
                        )}
                    </Row>

                    <h4 className="mt-4 border-bottom pb-2 text-primary fw-bold">
                        {user?.role === 'professor' ? '📑 Últimas Redações Recebidas' : '📜 Seu Histórico de Envios'}
                    </h4>

                    {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div> : (
                        <ListGroup variant="flush" className="bg-body">
                            {redacoes.map(r => (
                                <ListGroup.Item key={r.id} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-3 border-bottom gap-3 bg-body">
                                    <div className="w-100">
                                        <span className="fw-bold text-body fs-5">
                                            {r.Turma ? `[${r.Turma.nome}] ` : ''}
                                            {r.Proposta ? r.Proposta.titulo : 'Proposta Indefinida'}
                                        </span>
                                        <br />

                                        {user.role === 'professor' && (
                                            <div className="d-flex align-items-center mt-2">
                                                <div 
                                                    className="d-flex justify-content-center align-items-center bg-primary text-white fw-bold rounded-circle me-2 shadow-sm"
                                                    style={{ width: '35px', height: '35px', fontSize: '14px' }}
                                                    title={r.User?.nome}
                                                >
                                                    {getInitials(r.User?.nome)}
                                                </div>
                                                <strong className="text-body-secondary">{r.User?.nome}</strong>
                                            </div>
                                        )}

                                        <small className="text-body-secondary d-block mt-1">
                                            📅 Enviado em: {new Date(r.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 w-100 justify-content-md-end align-items-center">

                                        {r.status === 'Corrigida' && r.notaTotal !== null && (
                                            <Badge bg={r.notaTotal < 500 ? 'danger' : 'success'} className="px-2 py-1 fs-6">
                                                Nota: {r.notaTotal}
                                            </Badge>
                                        )}

                                        <Badge bg={r.status === 'Corrigida' ? 'success' : 'warning'} text={r.status === 'Corrigida' ? 'light' : 'dark'} className="px-2 py-1 fs-6">
                                            {r.status}
                                        </Badge>

                                        {user.role === 'professor' && r.status === 'Solicitado Reenvio' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="fw-bold flex-fill flex-md-grow-0"
                                                onClick={() => handleAutorizarReenvio(r.id)}
                                            >
                                                ✅ Autorizar Reenvio
                                            </Button>
                                        )}

                                        <Link to={`/redacao/${r.id}`} className="text-decoration-none flex-fill flex-md-grow-0">
                                            <Button variant={user.role === 'professor' && r.status !== 'Corrigida' ? "primary" : "outline-primary"} size="sm" className="w-100 fw-bold">
                                                {user.role === 'professor' ? '📝 Corrigir' : '👁️ Ver Detalhes'}
                                            </Button>
                                        </Link>

                                        {user.role === 'aluno' && r.status !== 'Corrigida' && (
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                className="fw-bold flex-fill flex-md-grow-0"
                                                onClick={() => abrirModalEdicao(r.id)}
                                            >
                                                ✏️ Editar Redação
                                            </Button>
                                        )}

                                    </div>
                                </ListGroup.Item>
                            ))}

                            {redacoes.length === 0 && (
                                <div className="text-center p-5 bg-body-tertiary rounded mt-3">
                                    <h5 className="text-body mb-0">Nenhuma redação registrada no sistema ainda.</h5>
                                    <p className="text-body-secondary mt-2">Quando enviar uma redação, ela aparecerá aqui.</p>
                                </div>
                            )}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditFile(null); }}>
                <Modal.Header closeButton className="bg-body-tertiary">
                    <Modal.Title className="fw-bold text-body">✏️ Reenviar Redação</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-body text-body">
                    <Form onSubmit={handleReenviarRedacao}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold d-block text-center mb-3">
                                A sua redação anterior será substituída. Escolha a nova imagem:
                            </Form.Label>

                            <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                                <Button variant="outline-primary" className="flex-fill py-3 fw-bold" onClick={() => cameraEditRef.current?.click()}>
                                    📸 Tirar Nova Foto
                                </Button>
                                <Button variant="outline-secondary" className="flex-fill py-3 fw-bold" onClick={() => galeriaEditRef.current?.click()}>
                                    📂 Escolher Arquivo
                                </Button>
                            </div>

                            <input type="file" accept="image/*" capture="environment" ref={cameraEditRef} style={{ display: 'none' }} onChange={e => setEditFile(e.target.files[0])} />
                            <input type="file" accept="image/*" ref={galeriaEditRef} style={{ display: 'none' }} onChange={e => setEditFile(e.target.files[0])} />

                            {editFile && (
                                <Alert variant="success" className="text-center mt-3 text-body">
                                    ✅ Novo arquivo selecionado: <br /><strong>{editFile.name}</strong>
                                </Alert>
                            )}
                        </Form.Group>

                        <Button variant="warning" type="submit" className="w-100 py-2 fw-bold text-dark" disabled={editLoading || !editFile}>
                            {editLoading ? <Spinner size="sm" /> : 'Confirmar Atualização'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Dashboard;