import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Alert, Badge, InputGroup, Modal, ListGroup } from 'react-bootstrap';
import { ReactSketchCanvas } from 'react-sketch-canvas'; 

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
  const canvasRef = useRef(null); 
  
  const [redacao, setRedacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false); 
  const [successMsg, setSuccessMsg] = useState('');
  
  const [zoomLevel, setZoomLevel] = useState(1); 

  const [notas, setNotas] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [total, setTotal] = useState(0);
  const [descricoes, setDescricoes] = useState([]); 
  const [isAnulada, setIsAnulada] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);

  const [imagemSeguraUrl, setImagemSeguraUrl] = useState('');
  const [imagemCarregando, setImagemCarregando] = useState(true);

  // Estados do Editor e da Memória de Desenho
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#ff0000'); 
  const [eraserMode, setEraserMode] = useState(false);
  
  const [draftImage, setDraftImage] = useState(null); 
  const [draftPaths, setDraftPaths] = useState([]);  

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
        setError(err.response?.data?.message || 'Erro ao carregar redação.');
      } finally {
        setLoading(false);
      }
    };
    fetchRedacao();
  }, [id]);

  useEffect(() => {
      const baixarImagemSegura = async () => {
          if (!redacao || !redacao.imagemUrl) return;
          try {
              setImagemCarregando(true);
              const partes = redacao.imagemUrl.replace(/\\/g, '/').split('/');
              const nomeArquivo = partes[partes.length - 1];
              const response = await api.get(`/../uploads/${nomeArquivo}`, { responseType: 'blob' });
              
              const reader = new FileReader();
              reader.readAsDataURL(response.data);
              reader.onloadend = () => {
                  setImagemSeguraUrl(reader.result); 
                  setImagemCarregando(false);
              };
          } catch { 
              setImagemSeguraUrl('');
              setImagemCarregando(false);
          }
      };
      baixarImagemSegura();
  }, [redacao]);

  useEffect(() => {
    const novoTotal = Object.values(notas).reduce((acc, nota) => acc + parseInt(nota || 0, 10), 0);
    setTotal(novoTotal);
  }, [notas]);

  useEffect(() => {
      if (showEditorModal && isProfessor && canvasRef.current && draftPaths.length > 0) {
          setTimeout(() => {
              canvasRef.current.clearCanvas(); 
              canvasRef.current.loadPaths(draftPaths);
          }, 100);
      }
  }, [showEditorModal, isProfessor, draftPaths]);

  const handleNotaChange = (competencia, valor) => setNotas(prev => ({ ...prev, [competencia]: parseInt(valor, 10) }));
  const handleAdicionarDescricao = () => setDescricoes(prev => [...prev, { id: Date.now(), texto: '' }]);
  const handleDescricaoChange = (id, novoTexto) => setDescricoes(prev => prev.map(d => d.id === id ? { ...d, texto: novoTexto } : d));
  const handleRemoverDescricao = (id) => setDescricoes(prev => prev.filter(d => d.id !== id));

  const handleToggleAnulacao = (e) => {
    const checked = e.target.checked;
    setIsAnulada(checked);
    if (checked) setNotas({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    else setMotivoSelecionado('');
  };

  const dataURItoFile = (dataURI, filename) => {
      const arr = dataURI.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){ u8arr[n] = bstr.charCodeAt(n); }
      return new File([u8arr], filename, {type:mime});
  };

  const handleAplicarDesenho = async () => {
      if (canvasRef.current) {
          try {
              const exportedImage = await canvasRef.current.exportImage("png");
              const paths = await canvasRef.current.exportPaths();
              
              setDraftImage(exportedImage); 
              setDraftPaths(paths);         
              
              setShowEditorModal(false);    
          } catch (e) {
              console.error("Erro ao exportar desenho:", e);
          }
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

    const formData = new FormData();
    formData.append('notas', JSON.stringify(notas));
    formData.append('total', notaFinalEnvio);
    formData.append('itensAnulatorios', JSON.stringify(arrayAnulatorios));
    formData.append('descricoes', JSON.stringify(arrayDescricoes));
    formData.append('status', 'Corrigida');
    
    if (draftImage) {
        const fileToUpload = dataURItoFile(draftImage, `correcao_${id}.png`);
        formData.append('imagem', fileToUpload);
    }

    try {
      await api.put(`/redacoes/${id}/corrigir`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      
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
      setError(err.response?.data?.message || 'Erro ao salvar correção.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (!redacao) return null;

  const anulatoriosAtuais = isAnulada ? [motivoSelecionado] : (redacao.itensAnulatorios || []);
  const estaAnulada = anulatoriosAtuais.length > 0 && anulatoriosAtuais[0] !== "";
  const notaExibida = estaAnulada ? 0 : total;

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h2 className="m-0 fw-bold text-primary text-center text-md-start">📝 Correção de Redação</h2>
        <div className="d-flex gap-2 justify-content-center justify-content-md-end">
            <Button variant="outline-info" className="flex-fill flex-md-grow-0 fw-bold" onClick={() => setShowCriteria(true)}>ℹ️ Critérios</Button>
            <Button variant="secondary" className="flex-fill flex-md-grow-0 fw-bold" onClick={() => navigate('/dashboard')}>Voltar</Button>
        </div>
      </div>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="h-100 shadow-sm border-0 bg-body">
            <Card.Header className="text-center py-3 bg-body-tertiary border-0">
              <h3 className="fw-bold text-primary mb-2">{redacao.Proposta ? redacao.Proposta.titulo : 'Tema Livre'}</h3>
              <h5 className="fw-bold text-body m-0">👤 Aluno: {redacao.User?.nome}</h5>
              {redacao.editedAt && (
                  <Badge bg="warning" text="dark" className="fs-6 mt-3 text-wrap p-2 lh-base">
                      ⚠️ Imagem editada pelo aluno em: <br className="d-md-none" /> {new Date(redacao.editedAt).toLocaleString()}
                  </Badge>
              )}
            </Card.Header>

            <Card.Body 
                style={{ minHeight: '600px', backgroundColor: 'var(--bs-tertiary-bg)', textAlign: 'center', cursor: 'zoom-in' }} 
                className="d-flex flex-column align-items-center justify-content-center p-0 overflow-hidden"
                onClick={() => { setZoomLevel(1); setShowEditorModal(true); }}
                title="Clique para abrir o Editor e a Lupa"
            >
              {imagemCarregando ? (
                  <div className="py-5"><Spinner animation="border" variant="primary" /><p className="mt-3 text-body">A transferir imagem segura...</p></div>
              ) : imagemSeguraUrl ? (
                  <Image 
                    src={draftImage || imagemSeguraUrl} 
                    fluid 
                    style={{ maxHeight: '800px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                  />
              ) : (
                  <Alert variant="danger" className="m-4">Não foi possível carregar a imagem.</Alert>
              )}
            </Card.Body>
            <Card.Footer className="text-center text-light bg-primary">
                <small className="fw-bold">🖱️ Clique na imagem para usar o Zoom e as Ferramentas de Correção!</small>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={5}>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}

          <Card className="mb-4 shadow text-center border-primary bg-body">
            <Card.Body className="py-4">
                <h4 className="text-body-secondary text-uppercase">Nota Final</h4>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: notaExibida >= 600 ? '#198754' : '#dc3545' }}>
                    {notaExibida}
                    <span style={{ fontSize: '1.5rem', color: 'var(--bs-secondary-color)' }}> / 1000</span>
                </div>
                {estaAnulada && <Badge bg="danger">REDAÇÃO ANULADA</Badge>}
            </Card.Body>
          </Card>

          {(isProfessor || estaAnulada) && (
            <Card className="mb-3 shadow-sm border-danger bg-body">
                <Card.Header className="bg-danger text-white">🚫 Anulação</Card.Header>
                <Card.Body>
                    {isProfessor ? (
                        <>
                            <Form.Check type="switch" id="anular" label="ANULAR REDAÇÃO" checked={isAnulada} onChange={handleToggleAnulacao} className="fw-bold text-danger mb-3 fs-5" />
                            {isAnulada && (
                                <Form.Select value={motivoSelecionado} onChange={(e) => setMotivoSelecionado(e.target.value)}>
                                    <option value="">Selecione o motivo...</option>
                                    {MOTIVOS_ANULACAO.map((m, i) => <option key={i} value={m}>{m}</option>)}
                                </Form.Select>
                            )}
                        </>
                    ) : <Alert variant="danger" className="m-0 text-center"><strong>MOTIVO:</strong> {anulatoriosAtuais[0]}</Alert>}
                </Card.Body>
            </Card>
          )}

          {(isProfessor || descricoes.length > 0) && (
            <Card className="mb-3 shadow-sm bg-body">
                <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                <span>💬 Comentários / Feedback</span>
                {isProfessor && <Button variant="light" size="sm" onClick={handleAdicionarDescricao}>+ Add</Button>}
                </Card.Header>
                <Card.Body>
                {descricoes.length === 0 ? <p className="text-body-secondary text-center mb-0">Nenhum comentário.</p> : (
                    descricoes.map((desc) => (
                    <InputGroup className="mb-2" key={desc.id}>
                        <Form.Control as="textarea" rows={2} value={desc.texto} disabled={!isProfessor} onChange={(e) => handleDescricaoChange(desc.id, e.target.value)} />
                        {isProfessor && <Button variant="outline-danger" onClick={() => handleRemoverDescricao(desc.id)}>X</Button>}
                    </InputGroup>
                    ))
                )}
                </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm bg-body">
            <Card.Header className="bg-success text-white">📊 Competências</Card.Header>
            <Card.Body>
              <Form>
                {[1, 2, 3, 4, 5].map(c => (
                  <div key={c} className="mb-3 border-bottom pb-2">
                    <label className="fw-bold d-flex justify-content-between text-body">
                        <span>Competência {c}</span>
                        <span className="text-primary">{notas[`c${c}`]} pts</span>
                    </label>
                    <Form.Select size="sm" value={notas[`c${c}`]} onChange={(e) => handleNotaChange(`c${c}`, e.target.value)} disabled={!isProfessor || isAnulada} className="mt-1">
                      <option value={0}>0 - Desconhecimento</option>
                      {niveisCompetencia.filter(n=>n.value>0).map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </Form.Select>
                  </div>
                ))}
              </Form>
            </Card.Body>
            {isProfessor && (
              <Card.Footer className="d-grid bg-body-tertiary">
                <Button variant="primary" size="lg" onClick={handleSalvarCorrecao} disabled={isSaving}>
                  {isSaving ? <Spinner as="span" animation="border" size="sm" /> : '💾 Salvar Correção Definitiva'}
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      <Modal show={showCriteria} onHide={() => setShowCriteria(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title>Critérios de Anulação</Modal.Title></Modal.Header>
        <Modal.Body className="bg-body text-body">
            <p>A redação será anulada se apresentar qualquer um dos seguintes problemas:</p>
            <ListGroup variant="flush">{MOTIVOS_ANULACAO.map((m, i) => <ListGroup.Item key={i} className="bg-body text-body">❌ {m}</ListGroup.Item>)}</ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showEditorModal} onHide={() => setShowEditorModal(false)} fullscreen>
        <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary d-flex align-items-center">
          <Modal.Title className="fw-bold me-auto d-none d-md-block">
              {isProfessor ? '🎨 Estúdio de Correção' : '🔍 Visualização Ampliada'}
          </Modal.Title>
          
          <div className="d-flex flex-wrap gap-2 align-items-center me-3">
              <div className="d-flex align-items-center gap-1 bg-secondary px-2 py-1 rounded">
                <Button variant="link" className="text-white text-decoration-none p-0 fs-5" onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))} title="Diminuir Zoom">➖</Button>
                <span className="text-white fw-bold mx-2" style={{minWidth: '40px', textAlign: 'center'}}>{Math.round(zoomLevel * 100)}%</span>
                <Button variant="link" className="text-white text-decoration-none p-0 fs-5" onClick={() => setZoomLevel(prev => prev + 0.25)} title="Aumentar Zoom">➕</Button>
                <Button variant="outline-light" size="sm" className="ms-2" onClick={() => setZoomLevel(1)}>Reset</Button>
              </div>

              {isProfessor && (
                  <>
                      <div className="vr d-none d-md-block mx-2 text-light"></div>
                      
                      <Button variant={eraserMode ? 'primary' : 'outline-light'} size="sm" onClick={() => {
                          setEraserMode(!eraserMode);
                          canvasRef.current?.eraseMode(!eraserMode);
                      }}>
                          {eraserMode ? '🖍️ Voltar p/ Caneta' : '🧼 Borracha'}
                      </Button>
                      
                      <Form.Control
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          title="Cor da Caneta"
                          style={{ width: '40px', height: '35px', padding: '2px', cursor: 'pointer' }}
                      />
                      
                      <Button variant="outline-warning" size="sm" onClick={() => canvasRef.current?.undo()} title="Desfazer">↩️</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => canvasRef.current?.clearCanvas()} title="Apagar Tudo">🗑️</Button>
                      
                      <div className="vr d-none d-md-block mx-2 text-light"></div>
                      
                      <Button variant="success" size="sm" className="fw-bold" onClick={handleAplicarDesenho}>
                          💾 Aplicar Desenho e Voltar
                      </Button>
                  </>
              )}
          </div>
        </Modal.Header>

        <Modal.Body className="text-center bg-dark p-4 d-flex justify-content-center align-items-start" style={{ overflow: 'auto' }}>
           {imagemSeguraUrl && (
             <div style={{ 
                 transform: `scale(${zoomLevel})`, 
                 transformOrigin: 'top center', 
                 transition: 'transform 0.2s ease-out',
                 width: '800px',
                 height: '1131px',
                 backgroundColor: '#fff',
                 boxShadow: '0 0 15px rgba(0,0,0,0.5)'
             }}>
                 {isProfessor ? (
                     <ReactSketchCanvas
                        ref={canvasRef}
                        strokeWidth={4}
                        eraserWidth={20}
                        strokeColor={strokeColor}
                        backgroundImage={imagemSeguraUrl} 
                        preserveBackgroundImageAspectRatio="contain"
                        style={{ cursor: eraserMode ? 'cell' : 'crosshair', border: 'none' }}
                        width="800px" 
                        height="1131px"
                     />
                 ) : (
                     <img 
                       src={draftImage || imagemSeguraUrl} 
                       alt="Redação com Zoom" 
                       style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                     />
                 )}
             </div>
           )}
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default CorrecaoRedacao;