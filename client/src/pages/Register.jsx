import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; 

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('aluno');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (role === 'professor' && !email.endsWith('@ifma.edu.br')) {
        return setError('Professor deve usar email: @ifma.edu.br');
    }
    if (role === 'aluno' && !email.endsWith('@acad.ifma.edu.br')) {
        return setError('Aluno deve usar email: @acad.ifma.edu.br');
    }
    if (password.length < 8) {
        return setError('Senha mínima: 8 caracteres');
    }

    setLoading(true);

    try {
      console.log("Enviando cadastro..."); 
      await axios.post('http://localhost:3001/api/auth/register', { nome, email, password, role });

      console.log("Sucesso! Redirecionando..."); 
      
      navigate('/login', { 
        state: { 
          message: 'Cadastro feito! Verifique o link no terminal do servidor.',
          emailPreenchido: email 
        } 
      });

    } catch (err) {
      console.error("Erro no cadastro:", err); 
      setError(err.response?.data?.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Criar Conta</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Institucional</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Eu sou</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Cadastrar'}
            </Button>
          </Form>
          
          <div className="w-100 text-center mt-3">
            Já tem conta? <Link to="/login">Faça Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;