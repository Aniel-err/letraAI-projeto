import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); 
    setError('');

    if (password !== confirm) return setError('As senhas não coincidem.');
    if (password.length < 8) return setError('Mínimo 8 caracteres.');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      
      setMsg('Senha alterada com sucesso! Redirecionando para o login...');
      
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Link expirado ou inválido.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
        <Container className="mt-5">
            <Alert variant="danger">Link inválido ou incompleto. Verifique seu email novamente.</Alert>
        </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="text-center mb-4">Redefinir Senha</h3>
          
          {msg && <Alert variant="success">{msg}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Nova Senha</Form.Label>
                <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Mínimo 8 caracteres"
                    required 
                />
            </Form.Group>
            
            <Form.Group className="mb-4">
                <Form.Label>Confirmar Senha</Form.Label>
                <Form.Control 
                    type="password" 
                    value={confirm} 
                    onChange={e => setConfirm(e.target.value)} 
                    placeholder="Repita a senha"
                    required 
                />
            </Form.Group>
            
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Salvar Nova Senha'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResetPassword;