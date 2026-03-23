import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; 

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
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

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.828 2.829zm-4.79 1.499 1.123 1.123A13 13 0 0 1 1.172 8q.086-.13.195-.288c.335-.48.83-1.12 1.465-1.755A11 11 0 0 1 8 3.5c.579 0 1.146.083 1.683.238l.83.831A10 10 0 0 0 8 4.5c-2.12 0-3.879 1.168-5.168 2.457A13 13 0 0 0 1.172 8q.086.13.195.288c.335.48.83 1.12 1.465 1.755q.247.248.517.486z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.828 2.829z"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
  );

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-lg border-0 bg-body">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold text-primary">LetraAi ✍️</h2>
          <h5 className="text-center mb-4 text-body-secondary">Seja bem-vindo!</h5>
          
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-body fw-semibold">E-mail Institucional</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="nome@ifma.edu.br"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="text-body fw-semibold">Senha</Form.Label>
              <InputGroup>
                <Form.Control 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Sua senha de acesso"
                  required 
                />
                <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="border-start-0 d-flex align-items-center bg-transparent"
                >
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="text-end mb-4">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-decoration-none text-body-secondary" 
                  onClick={() => { setShowForgot(true); setForgotMsg(''); setForgotEmail(''); }}
                >
                    Esqueceu a sua senha?
                </Button>
            </div>

            <Button type="submit" className="btn-academico mb-3 py-2" size="lg" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Entrar no Sistema'}
            </Button>
          </Form>

          {showResend && (
            <div className="d-grid mb-3">
              <Button variant="outline-warning" size="sm" className="fw-bold" onClick={handleResendVerification}>
                Reenviar E-mail de Ativação
              </Button>
            </div>
          )}

          <div className="text-center mt-3 text-body">
            <span className="text-body-secondary">Novo por aqui? </span>
            <Link to="/cadastro" className="fw-bold text-decoration-none">Criar uma conta</Link>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showForgot} onHide={() => setShowForgot(false)} centered>
        <Modal.Header closeButton className="bg-body border-0"><Modal.Title className="text-body">Recuperar Acesso</Modal.Title></Modal.Header>
        <Modal.Body className="bg-body px-4">
          <p className="text-body-secondary mb-4 small">Informe o seu e-mail cadastrado para receber o link de redefinição.</p>
          <Form.Group className="mb-3">
            <Form.Control 
              type="email" 
              placeholder="seu-email@ifma.edu.br" 
              value={forgotEmail} 
              onChange={e => setForgotEmail(e.target.value)} 
            />
          </Form.Group>
          {forgotMsg && <Alert variant={forgotMsg.includes('Erro') ? 'danger' : 'success'} className="py-2 small">{forgotMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer className="bg-body border-0">
          <Button variant="light" className="fw-bold" onClick={() => setShowForgot(false)}>Cancelar</Button>
          <Button variant="primary" className="fw-bold" onClick={handleForgotSubmit} disabled={forgotLoading || !forgotEmail}>
            {forgotLoading ? <Spinner animation="border" size="sm" /> : 'Enviar E-mail'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;