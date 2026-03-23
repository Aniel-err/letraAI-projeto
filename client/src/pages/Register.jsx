import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('aluno');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
  );

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
        return setError('A senha deve ter no mínimo 8 caracteres.');
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { nome, email, password, role });
      
      navigate('/login', { 
        state: { 
          message: 'Cadastro realizado com sucesso! Verifique o link de ativação no terminal do seu servidor.',
          emailPreenchido: email 
        } 
      });

    } catch (err) {
      console.error("Erro no cadastro:", err); 
      setError(err.response?.data?.message || 'Ocorreu um erro ao criar a sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '450px' }} className="shadow-lg border-0 bg-body">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">LetrAI ✍️</h2>
            <h5 className="text-body-secondary">Crie a sua conta gratuita</h5>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-body fw-semibold">Nome Completo</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Como quer ser chamado?"
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-body fw-semibold">E-mail Institucional</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="seu-email@ifma.edu.br"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <Form.Text className="text-body-secondary">
                Use o seu e-mail do IFMA ou acadêmico.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-body fw-semibold">Senha</Form.Label>
              <InputGroup>
                <Form.Control 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Mínimo 8 caracteres"
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

            <Form.Group className="mb-4">
              <Form.Label className="text-body fw-semibold">Eu sou</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)} className="bg-body text-body">
                <option value="aluno">Aluno (Ensino Médio / Superior)</option>
                <option value="professor">Professor / Corretor</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

            <Button type="submit" className="btn-academico mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Criar minha conta'}
            </Button>
          </Form>
          
          <div className="w-100 text-center mt-3 text-body">
            <span className="text-body-secondary">Já possui acesso? </span>
            <Link to="/login" className="fw-bold text-decoration-none">Faça o seu login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;