import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Alert, Badge, InputGroup, Modal, ListGroup } from 'react-bootstrap';

const niveisCompetencia = [
  { label: "Nível 0: 0 pontos (Desconhecimento total)", value: 0 },
  { label: "Nível 1: 40 pontos (Domínio precário)", value: 40 },
  { label: "Nível 2: 80 pontos (Domínio insuficiente)", value: 80 },
  { label: "Nível 3: 120 pontos (Domínio mediano)", value: 120 },
  { label: "Nível 4: 160 pontos (Domínio bom)", value: 160 },
  { label: "Nível 5: 200 pontos (Domínio excelente)", value: 200 }
];

const MOTIVOS_ANULACAO = [
  "Fuga total ao tema",
  "Não atendimento ao tipo textual",
  "Texto insuficiente",
  "Cópia integral de texto motivador",
  "Texto em branco",
  "Impropérios, desenhos e outras formas propositais de anulação",
  "Desrespeito aos direitos humanos"
];

function CorrecaoRedacao() {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [redacao, setRedacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false); 
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showZoom, setShowZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); 

  const [notas, setNotas] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [total, setTotal] = useState(0);
  
  const [descricoes, setDescricoes] = useState([]); 
  
  const [isAnulada, setIsAnulada] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);

  const isProfessor = user?.role === 'professor';

  useEffect(() => {
    const fetchRedacao = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/redacoes/${id}`);
        const data = response.data;
        setRedacao(data);
        
        setNotas({
          c1: data.notaC1 || 0,
          c2: data.notaC2 || 0,
          c3: data.notaC3 || 0,
          c4: data.notaC4 || 0,
          c5: data.notaC5 || 0,
        });

        if (data.descricoes && Array.isArray(data.descricoes)) {
            setDescricoes(data.descricoes.map((texto, index) => ({ id: index, texto })));
        } else {
            setDescricoes([]);
        }

        const anulatorios = data.itensAnulatorios || [];
        if (anulatorios.length > 0) {
            setIsAnulada(true);
            setMotivoSelecionado(anulatorios[0]);
        } else {
            setIsAnulada(false);
            setMotivoSelecionado('');
        }
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Erro ao carregar redação.');
      } finally {
        setLoading(false);
      }
    };
    fetchRedacao();
  }, [id]);

  useEffect(() => {
    const novoTotal = Object.values(notas).reduce((acc, nota) => acc + parseInt(nota || 0, 10), 0);
    setTotal(novoTotal);
  }, [notas]);

  const handleNotaChange = (competencia, valor) => {
    const novaNota = parseInt(valor, 10);
    setNotas(prev => ({ ...prev, [competencia]: novaNota }));
  };

  const handleAdicionarDescricao = () => {
    setDescricoes(prev => [...prev, { id: Date.now(), texto: '' }]);
  };

  const handleDescricaoChange = (id, novoTexto) => {
    setDescricoes(prev => prev.map(d => d.id === id ? { ...d, texto: novoTexto } : d));
  };

  const handleRemoverDescricao = (id) => {
    setDescricoes(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleAnulacao = (e) => {
    const checked = e.target.checked;
    setIsAnulada(checked);
    if (checked) {
        setNotas({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    } else {
        setMotivoSelecionado('');
    }
  };

  const handleSalvarCorrecao = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    if (isAnulada && !motivoSelecionado) {
        setError('Por favor, selecione um motivo para anular a redação.');
        setIsSaving(false);
        return;
    }

    const arrayAnulatorios = isAnulada ? [motivoSelecionado] : [];
    const arrayDescricoes = descricoes.map(d => d.texto).filter(t => t && t.trim() !== '');
    const notaFinalEnvio = isAnulada ? 0 : total;

    const payload = { 
        notas, 
        total: notaFinalEnvio, 
        itensAnulatorios: arrayAnulatorios, 
        descricoes: arrayDescricoes,
        status: 'Corrigida'
    };
    
    try {
      await api.put(`/redacoes/${id}/corrigir`, payload);
      setSuccessMsg('Correção salva com sucesso!');
      
      setRedacao(prev => ({ 
          ...prev, 
          notaC1: notas.c1, notaC2: notas.c2, notaC3: notas.c3, notaC4: notas.c4, notaC5: notas.c5,
          status: 'Corrigida',
          itensAnulatorios: arrayAnulatorios, 
          descricoes: arrayDescricoes,
          notaTotal: notaFinalEnvio
      }));
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao salvar correção.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => prev + 0.25);
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  const openZoomModal = () => {
      setZoomLevel(1); 
      setShowZoom(true);
  };
  
  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (!redacao) return null;

  const anulatoriosAtuais = isAnulada ? [motivoSelecionado] : (redacao.itensAnulatorios || []);
  const estaAnulada = anulatoriosAtuais.length > 0 && anulatoriosAtuais[0] !== "";
  const notaExibida = estaAnulada ? 0 : total;

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">📝 Correção de Redação</h2>
        <div>
            <Button variant="outline-info" className="me-2" onClick={() => setShowCriteria(true)}>
                ℹ️ Critérios de Anulação
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
        </div>
      </div>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="text-center py-3">
              <h3 className="fw-bold text-primary mb-2">{redacao.tema}</h3>
              <h5 className="fw-bold text-body">
                👤 Aluno: {redacao.User?.nome}
              </h5>
              
              {redacao.editedAt && (
                  <div className="mt-2">
                    <Badge bg="warning" text="dark" className="fs-6 border border-dark">
                        ⚠️ Imagem editada pelo aluno em: {new Date(redacao.editedAt).toLocaleString()}
                    </Badge>
                  </div>
              )}
            </Card.Header>
            <Card.Body style={{ minHeight: '600px', backgroundColor: '#f8f9fa', textAlign: 'center', overflow: 'auto' }}>
              {redacao.imagemUrl ? (
                  <Image 
                    src={redacao.imagemUrl} 
                    fluid 
                    style={{ maxHeight: '800px', cursor: 'zoom-in', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                    onClick={openZoomModal}
                    title="Clique para ampliar a imagem"
                  />
              ) : (
                  <p className="mt-5 text-muted">Imagem não disponível.</p>
              )}
            </Card.Body>
            <Card.Footer className="text-center text-muted">
                <small>💡 Clique na imagem para visualizar em tela cheia.</small>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={5}>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}

          <Card className="mb-4 shadow text-center border-primary">
            <Card.Body className="py-4">
                <h4 className="text-muted text-uppercase" style={{ letterSpacing: '2px' }}>Nota Final</h4>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: notaExibida >= 600 ? '#198754' : '#dc3545' }}>
                    {notaExibida}
                    <span style={{ fontSize: '1.5rem', color: '#6c757d' }}> / 1000</span>
                </div>
                {estaAnulada && <Badge bg="danger">REDAÇÃO ANULADA</Badge>}
            </Card.Body>
          </Card>

          {(isProfessor || estaAnulada) && (
            <Card className="mb-3 shadow-sm border-danger">
                <Card.Header className="bg-danger text-white">🚫 Anulação</Card.Header>
                <Card.Body>
                    {isProfessor ? (
                        <>
                            <Form.Check 
                                type="switch"
                                id="anular-switch"
                                label="ANULAR REDAÇÃO"
                                checked={isAnulada}
                                onChange={handleToggleAnulacao}
                                className="fw-bold text-danger mb-3 fs-5"
                            />
                            {isAnulada && (
                                <Form.Select 
                                    value={motivoSelecionado}
                                    onChange={(e) => setMotivoSelecionado(e.target.value)}
                                >
                                    <option value="">Selecione o motivo...</option>
                                    {MOTIVOS_ANULACAO.map((m, i) => (
                                        <option key={i} value={m}>{m}</option>
                                    ))}
                                </Form.Select>
                            )}
                        </>
                    ) : (
                        <Alert variant="danger" className="m-0 text-center">
                            <strong>MOTIVO:</strong> {anulatoriosAtuais[0]}
                        </Alert>
                    )}
                </Card.Body>
            </Card>
          )}

          {(isProfessor || descricoes.length > 0) && (
            <Card className="mb-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                <span>💬 Comentários / Feedback</span>
                {isProfessor && (
                    <Button variant="light" size="sm" onClick={handleAdicionarDescricao}>+ Add</Button>
                )}
                </Card.Header>
                <Card.Body>
                {descricoes.length === 0 ? <p className="text-muted text-center mb-0">Nenhum comentário.</p> : (
                    descricoes.map((desc) => (
                    <InputGroup className="mb-2" key={desc.id}>
                        <Form.Control
                        as="textarea" rows={2}
                        placeholder="Comentário..."
                        value={desc.texto}
                        disabled={!isProfessor}
                        onChange={(e) => handleDescricaoChange(desc.id, e.target.value)}
                        />
                        {isProfessor && (
                            <Button variant="outline-danger" onClick={() => handleRemoverDescricao(desc.id)}>X</Button>
                        )}
                    </InputGroup>
                    ))
                )}
                </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">📊 Competências</Card.Header>
            <Card.Body>
              <Form>
                {[1, 2, 3, 4, 5].map(c => (
                  <div key={c} className="mb-3 border-bottom pb-2">
                    <label className="fw-bold d-flex justify-content-between">
                        <span>Competência {c}</span>
                        <span className="text-primary">{notas[`c${c}`]} pts</span>
                    </label>
                    <Form.Select 
                      size="sm"
                      value={notas[`c${c}`]}
                      onChange={(e) => handleNotaChange(`c${c}`, e.target.value)}
                      disabled={!isProfessor || isAnulada}
                      className="mt-1"
                    >
                      <option value={0}>0 - Desconhecimento</option>
                      {niveisCompetencia.filter(n=>n.value>0).map(n => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                      ))}
                    </Form.Select>
                  </div>
                ))}
              </Form>
            </Card.Body>
            {isProfessor && (
              <Card.Footer className="d-grid">
                <Button variant="primary" size="lg" onClick={handleSalvarCorrecao} disabled={isSaving}>
                  {isSaving ? <Spinner as="span" animation="border" size="sm" /> : '💾 Salvar Correção'}
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      <Modal show={showCriteria} onHide={() => setShowCriteria(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Critérios de Anulação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>A redação será anulada (nota 0) se apresentar qualquer um dos seguintes problemas:</p>
            <ListGroup variant="flush">
                {MOTIVOS_ANULACAO.map((m, i) => (
                    <ListGroup.Item key={i}>❌ {m}</ListGroup.Item>
                ))}
            </ListGroup>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCriteria(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showZoom} onHide={() => setShowZoom(false)} centered size="xl">
        <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary d-flex align-items-center">
          <Modal.Title className="me-auto">🔍 Visualização Ampliada</Modal.Title>
          <div className="d-flex gap-2 me-4">
              <Button variant="secondary" size="sm" onClick={handleZoomOut} title="Diminuir Zoom">➖</Button>
              <span className="text-white align-self-center border px-2 rounded" style={{minWidth: '60px', textAlign: 'center'}}>
                  {Math.round(zoomLevel * 100)}%
              </span>
              <Button variant="secondary" size="sm" onClick={handleZoomIn} title="Aumentar Zoom">➕</Button>
              <Button variant="outline-light" size="sm" onClick={handleResetZoom}>Reset</Button>
          </div>
        </Modal.Header>
        <Modal.Body className="text-center bg-dark p-0" style={{ overflow: 'auto', maxHeight: '90vh' }}>
           {redacao && redacao.imagemUrl && (
             <div style={{ 
                 display: 'inline-block', 
                 minWidth: '100%', 
                 minHeight: '100%' 
             }}>
                 <img 
                   src={redacao.imagemUrl} 
                   alt="Redação Zoom" 
                   style={{ 
                       transform: `scale(${zoomLevel})`, 
                       transformOrigin: 'top center', 
                       transition: 'transform 0.2s ease-out',
                       maxWidth: '100%', 
                       display: 'block', 
                       margin: '0 auto' 
                   }} 
                 />
             </div>
           )}
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default CorrecaoRedacao;