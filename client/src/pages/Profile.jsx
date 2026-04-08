import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
  const { user, login } = useAuth();
  
  const [nome, setNome] = useState(user?.nome || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.828 2.829zm-4.79 1.499 1.123 1.123A13 13 0 0 1 1.172 8q.086-.13.195-.288c.335-.48.83-1.12 1.465-1.755A11 11 0 0 1 8 3.5c.579 0 1.146.083 1.683.238l.83.831A10 10 0 0 0 8 4.5c-2.12 0-3.879 1.168-5.168 2.457A13 13 0 0 0 1.172 8q.086.13.195.288c.335.48.83 1.12 1.465 1.755q.247.248.517.486z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('nome', nome.trim());
    
    if (password && password.length >= 8) {
        formData.append('password', password);
    }

    try {
      const response = await api.put('/auth/profile', formData);

      const token = sessionStorage.getItem('token');
      login(token, response.data.user);

      setMsg({ type: 'success', text: '✅ Perfil atualizado com sucesso!' });
      setPassword(''); 
    } catch (err) {
      console.error("Erro detalhado:", err.response?.data || err.message);
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 bg-body">
            <Card.Header className="bg-primary text-white text-center py-4 border-0">
                <h3 className="fw-bold m-0">Meu Perfil</h3>
            </Card.Header>
            <Card.Body className="p-4">
              
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-3">
                    <div 
                        className="d-flex justify-content-center align-items-center bg-primary text-white fw-bold rounded-circle shadow"
                        style={{ width: '130px', height: '130px', fontSize: '3rem' }}
                    >
                        {getInitials(user?.nome)}
                    </div>
                </div>
                <h5 className="mt-3 text-body fw-bold">{user?.email}</h5>
                <Badge bg="info" text="dark" className="fs-6 px-3 py-2 rounded-pill text-uppercase">
                    {user?.role}
                </Badge>
              </div>

              {msg.text && <Alert variant={msg.type} className="fw-bold text-center">{msg.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label className="text-body fw-semibold">Nome Completo</Form.Label>
                    <Form.Control type="text" value={nome} onChange={e => setNome(e.target.value)} className="bg-body-tertiary" />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="text-body fw-semibold">Nova Senha (Deixe em branco para não mudar)</Form.Label>
                    <InputGroup>
                        <Form.Control 
                            type={showPassword ? 'text' : 'password'} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Mínimo 8 caracteres"
                            className="bg-body-tertiary"
                        />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} className="d-flex align-items-center bg-transparent">
                            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                        </Button>
                    </InputGroup>
                </Form.Group>

                <div className="d-grid">
                    <Button variant="primary" size="lg" type="submit" disabled={loading} className="fw-bold">
                        {loading ? <Spinner size="sm" /> : 'Salvar Alterações'}
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;