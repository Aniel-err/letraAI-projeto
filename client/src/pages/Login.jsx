import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Card, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate, Link, useLocation } from 'react-router-dom'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      if (location.state.message) setSuccess(location.state.message);
      if (location.state.emailPreenchido) {
        setEmail(location.state.emailPreenchido);
        setResendEmail(location.state.emailPreenchido);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      
      login(response.data.token, response.data.user);
      
      navigate('/dashboard'); 

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSubmit = async () => {
    if(!resendEmail) return;
    setResendStatus('loading');
    setResendMsg('');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/resend-verification', { email: resendEmail });
      setResendStatus('success');
      setResendMsg(response.data.message);
    } catch (err) {
      setResendStatus('error');
      setResendMsg(err.response?.data?.message || 'Erro ao reenviar.');
    } finally {
        setResendStatus('');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Entrar - LetrAl</h2>
          
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Entrar'}
            </Button>
          </Form>

          <div className="text-center">
            <Button variant="link" size="sm" onClick={() => setShowResend(true)}>
              Não recebeu o email de confirmação?
            </Button>
          </div>
          
          <div className="w-100 text-center mt-3 border-top pt-3">
            Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Reenvio de Email */}
      <Modal show={showResend} onHide={() => setShowResend(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reenviar Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Informe seu email para receber um novo link de ativação.</p>
          <Form.Control 
            type="email" 
            placeholder="seu@email.com" 
            value={resendEmail} 
            onChange={(e) => setResendEmail(e.target.value)} 
          />
          {resendMsg && <Alert variant={resendStatus === 'error' ? 'danger' : 'success'} className="mt-3">{resendMsg}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResend(false)}>Fechar</Button>
          <Button variant="primary" onClick={handleResendSubmit} disabled={resendStatus === 'loading'}>
            {resendStatus === 'loading' ? 'Enviando...' : 'Enviar Link'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;