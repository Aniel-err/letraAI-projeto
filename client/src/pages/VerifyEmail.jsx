import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Spinner, Button } from 'react-bootstrap';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState(token ? 'verifying' : 'error');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/auth/verify-email', { token });
        
        if (response.data.token) {
            login(response.data.token, response.data.user);
            navigate('/dashboard', { replace: true }); 
        } 
        else {
            navigate('/login', { 
                state: { message: 'Conta verificada! Faça seu login.', emailPreenchido: '' } 
            });
        }

      } catch (error) {
        console.error("Erro na verificação:", error);
        setStatus('error');
      }
    };

    verify();
  }, [token, login, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem', textAlign: 'center', padding: '20px' }}>
        
        {status === 'verifying' && (
          <>
            <Spinner animation="border" className="mb-3" />
            <h4>Validando e Entrando...</h4>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-danger">Link Inválido</h2>
            <p>Este link expirou ou já foi utilizado.</p>
            <Button variant="primary" onClick={() => navigate('/login')}>Ir para Login</Button>
          </>
        )}

      </Card>
    </Container>
  );
}

export default VerifyEmail;