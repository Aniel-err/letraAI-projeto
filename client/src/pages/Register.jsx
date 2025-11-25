import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; 

function Register() {
  const [nome, setNome] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('aluno');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage('');
    setError('');

    try {
      const newUser = { nome, email, password, role }; 

      const response = await axios.post('http://localhost:3001/api/auth/register', newUser);

      setMessage(response.data.message); 

      setNome(''); 
      setEmail('');
      setPassword('');

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Criar Conta - LetrAl</h2>

          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="formBasicNome">
              <Form.Label>Nome Completo</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Seu nome completo" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email (usado apenas para login)</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Seu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Eu sou</Form.Label>
              <Form.Select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </Form.Select>
            </Form.Group>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Button variant="primary" type="submit" className="w-100">
              Cadastrar
            </Button>
          </Form>

          <div className="w-100 text-center mt-3">
            Já tem uma conta? <Link to="/login">Faça o Login</Link>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;