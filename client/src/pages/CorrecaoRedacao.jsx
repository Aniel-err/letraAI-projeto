import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Correção
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Alert, Badge, InputGroup } from 'react-bootstrap';

const niveisCompetencia = [
  { label: "Nível 0: 0 pontos (Desconhecimento total)", value: 0 },
  { label: "Nível 1: 40 pontos (Domínio precário)", value: 40 },
  { label: "Nível 2: 80 pontos (Domínio insuficiente)", value: 80 },
  { label: "Nível 3: 120 pontos (Domínio mediano)", value: 120 },
  { label: "Nível 4: 160 pontos (Domínio bom)", value: 160 },
  { label: "Nível 5: 200 pontos (Domínio excelente)", value: 200 }
];

const itensAnulatoriosOptions = [
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
  
  const [notas, setNotas] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [total, setTotal] = useState(0);
  const [itensAnulatorios, setItensAnulatorios] = useState([]); 
  const [descricoes, setDescricoes] = useState([]); 
  
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
        setItensAnulatorios(data.itensAnulatorios || []);
        setDescricoes(data.descricoes ? data.descricoes.map((texto, index) => ({ id: index, texto })) : []);
        
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar redação.');
      } finally {
        setLoading(false);
      }
    };
    fetchRedacao();
  }, [id]);

  useEffect(() => {
    const novoTotal = Object.values(notas).reduce((acc, nota) => acc + nota, 0);
    setTotal(novoTotal);
  }, [notas]);

  const handleNotaChange = (competencia, valor) => {
    const novaNota = parseInt(valor, 10);
    setNotas(prev => ({ ...prev, [competencia]: novaNota }));
  };

  const handleAnulatorioChange = (item) => {
    setItensAnulatorios(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
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
  
  const handleSalvarCorrecao = async () => {
    setIsSaving(true);
    const correcaoData = { notas, total, itensAnulatorios, descricoes: descricoes.map(d => d.texto) };
    
    try {
      await api.put(`/redacoes/${id}/corrigir`, correcaoData); 
      alert('Correção salva com sucesso!');
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar correção.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!redacao) return null;

  return (
    <Container fluid className="p-3">
      <Row className="bg-dark text-white p-2 mb-3 align-items-center">
        <Col><strong>LetrAl - Correção</strong></Col>
        <Col className="text-end">
          <Badge bg="light" text="dark">{user?.nome}</Badge>
          <Button variant="outline-light" size="sm" className="ms-2" onClick={() => navigate('/dashboard')}>Voltar</Button>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Redação de: {redacao.User?.nome} (Tema: {redacao.tema})</span>
              <Badge bg={itensAnulatorios.length > 0 ? "danger" : "primary"} pill>
                Pontuação Total: {itensAnulatorios.length > 0 ? 0 : total} / 1000
              </Badge>
            </Card.Header>
            <Card.Body style={{ height: '80vh', overflow: 'auto' }}>
              {redacao.imagemUrl && <Image src={redacao.imagemUrl} fluid />}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="mb-3">
            <Card.Header>Itens Anulatórios</Card.Header>
            <Card.Body>
              <Form>
                {itensAnulatoriosOptions.map((item, index) => (
                  <Form.Check 
                    key={index}
                    type="checkbox"
                    id={`check-anulatorio-${index}`}
                    label={item}
                    disabled={!isProfessor}
                    checked={itensAnulatorios.includes(item)}
                    onChange={() => handleAnulatorioChange(item)}
                  />
                ))}
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              Descrições
              <Button variant="primary" size="sm" disabled={!isProfessor} onClick={handleAdicionarDescricao}>+ Adicionar</Button>
            </Card.Header>
            <Card.Body>
              {descricoes.length === 0 ? (
                <p className="text-muted">Nenhuma descrição adicionada.</p>
              ) : (
                descricoes.map((desc) => (
                  <InputGroup className="mb-2" key={desc.id}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Digite a descrição..."
                      value={desc.texto}
                      disabled={!isProfessor}
                      onChange={(e) => handleDescricaoChange(desc.id, e.target.value)}
                    />
                    <Button variant="outline-danger" disabled={!isProfessor} onClick={() => handleRemoverDescricao(desc.id)}>&#x1F5D1;</Button>
                  </InputGroup>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Card>
            <Card.Header>Competências</Card.Header>
            <Card.Body>
              <Form>
                <Row className="fw-bold mb-2 d-none d-md-flex"> 
                  <Col md={3}>Competência</Col>
                  <Col md={7}>Nível</Col>
                  <Col md={2} className="text-end">Pontos</Col>
                </Row>
                
                {[1, 2, 3, 4, 5].map(c => (
                  <Row key={c} className="mb-3 mb-md-2 align-items-center border-bottom pb-2">
                    <Col md={3}><strong>Competência {c}</strong></Col>
                    <Col md={7}>
                      <Form.Select 
                        aria-label={`Competência ${c}`}
                        value={notas[`c${c}`]}
                        onChange={(e) => handleNotaChange(`c${c}`, e.target.value)}
                        disabled={!isProfessor}
                      >
                        <option value={0}>Selecione o nível</option>
                        {niveisCompetencia.map(n => (
                          <option key={n.label} value={n.value}>{n.label}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2} className="text-md-end text-start mt-2 mt-md-0">
                      <Badge bg="secondary" style={{ fontSize: '1rem' }}>
                        {notas[`c${c}`]} pontos
                      </Badge>
                    </Col>
                  </Row>
                ))}
              </Form>
            </Card.Body>
            
            {isProfessor && (
              <Card.Footer className="text-end">
                <Button variant="success" size="lg" onClick={handleSalvarCorrecao} disabled={isSaving}>
                  {isSaving ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar Correção'}
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CorrecaoRedacao;