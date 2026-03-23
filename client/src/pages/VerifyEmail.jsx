import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Spinner, Form, Alert } from 'react-bootstrap';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [countdown, setCountdown] = useState(5); 

  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const effectRan = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (effectRan.current === false) {
      const verify = async () => {
        try {
          await axios.post('/api/auth/verify-email', { token }); 
          setStatus('success');
        } catch (error) {
          console.error("Falha na verificação:", error);
          setStatus('error');
        }
      };

      verify();

      return () => {
        effectRan.current = true;
      };
    }
  }, [token]);

  useEffect(() => {
    let timer;
    if (status === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer); 
  }, [status, navigate]);


  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setResendStatus('loading');
    try {
      // Rota relativa para o reenvio
      const response = await axios.post('/api/auth/resend-verification', { email });
      setResendStatus('success');
      setResendMsg(response.data.message);
    } catch (err) {
      setResendStatus('error');
      setResendMsg(err.response?.data?.message || 'Erro ao reenviar.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem', padding: '20px' }}>
        
        {status === 'verifying' && (
          <div className="text-center">
            <Spinner animation="border" className="mb-3" />
            <h4>Validando seu link...</h4>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-success">Sucesso! 🎉</h2>
            <p className="lead">Sua conta foi ativada.</p>
            
            <Alert variant="info">
              Indo para a tela de login em <strong>{countdown}</strong> segundos...
            </Alert>

            <Button onClick={() => navigate('/login')} className="w-100">
              Fazer Login Agora
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h2 className="text-danger text-center">Link Inválido 😢</h2>
            <p className="text-center text-muted">Este link expirou ou já foi utilizado.</p>
            <hr />
            <h5>Gerar novo link:</h5>
            <Form onSubmit={handleResend}>
              <Form.Group className="mb-3">
                <Form.Control 
                  type="email" 
                  placeholder="Digite seu email cadastrado..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              {resendStatus === 'success' && <Alert variant="success">{resendMsg}</Alert>}
              {resendStatus === 'error' && <Alert variant="danger">{resendMsg}</Alert>}

              <Button variant="primary" type="submit" className="w-100 mb-2" disabled={resendStatus === 'loading'}>
                {resendStatus === 'loading' ? 'Gerando...' : 'Receber Novo Link'}
              </Button>
            </Form>
            
            <Button variant="link" className="w-100" onClick={() => navigate('/login')}>
              Voltar para Login
            </Button>
          </div>
        )}

      </Card>
    </Container>
  );
}

export default VerifyEmail;