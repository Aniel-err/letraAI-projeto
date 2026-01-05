import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; 
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state.emailPreenchido) {
        setEmail(location.state.emailPreenchido);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResend(false);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
    
      const { token, user } = response.data;

      login(token, user);
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setError('Sua conta ainda não foi ativada. Verifique seu e-mail.');
        setShowResend(true);
      } else {
        setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSuccess('');
      setError('');
      await api.post('/auth/resend-verification', { email });
      setSuccess('Novo link de ativação enviado!');
      setShowResend(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao reenviar link. Tente novamente mais tarde.');
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg('');

    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(`Sucesso: ${response.data.message}`);
    } catch (err) {
      console.error(err);
      setForgotMsg('Erro: E-mail não encontrado no sistema.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold text-primary">LetraAi</h2>
          <h5 className="text-center mb-4 text-muted">Acessar Conta</h5>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Endereço de Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <div className="text-end mb-3">
                <Button variant="link" size="sm" className="p-0 text-decoration-none text-muted" onClick={() => { setShowForgot(true); setForgotMsg(''); setForgotEmail(''); }}>
                    Esqueceu a senha?
                </Button>
            </div>
            <Button variant="primary" type="submit" className="w-100 mb-3" size="lg" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Entrar'}
            </Button>
          </Form>

          {showResend && (
            <div className="d-grid mb-3">
              <Button variant="outline-warning" size="sm" onClick={handleResendVerification}>Reenviar Link</Button>
            </div>
          )}

          <div className="text-center mt-3">
            <span className="text-muted">Não tem uma conta? </span>
            <Link to="/cadastro" className="fw-bold text-decoration-none">Cadastre-se</Link>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showForgot} onHide={() => setShowForgot(false)} centered>
        <Modal.Header closeButton><Modal.Title>Recuperar Senha</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-muted">Digite o e-mail associado à sua conta.</p>
          <Form.Group className="mb-3">
            <Form.Control type="email" placeholder="seu@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
          </Form.Group>
          {forgotMsg && <Alert variant={forgotMsg.includes('Erro') ? 'danger' : 'success'}>{forgotMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForgot(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleForgotSubmit} disabled={forgotLoading || !forgotEmail}>
            {forgotLoading ? 'Enviando...' : 'Enviar Link'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;