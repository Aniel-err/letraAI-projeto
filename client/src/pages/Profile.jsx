import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
  const { user, login } = useAuth();
  
  const [nome, setNome] = useState(user?.nome || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAvatar(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('nome', nome);
    if (password) formData.append('password', password);
    if (avatar) formData.append('avatar', avatar);

    try {
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const token = localStorage.getItem('token');
      login(token, response.data.user);

      setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setPassword(''); 
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setMsg({ type: 'danger', text: 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white text-center py-4">
                <h3>Meu Perfil</h3>
            </Card.Header>
            <Card.Body className="p-4">
              
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                    <Image 
                        src={preview || "https://via.placeholder.com/150"} 
                        roundedCircle 
                        className="border border-3 border-white shadow"
                        width="120" 
                        height="120"
                        style={{ objectFit: 'cover' }}
                    />
                    <Form.Label 
                        htmlFor="upload-avatar" 
                        className="position-absolute bottom-0 end-0 bg-secondary text-white rounded-circle p-2 shadow cursor-pointer"
                        style={{ cursor: 'pointer' }}
                    >
                        <i className="bi bi-camera-fill"></i>
                    </Form.Label>
                    <Form.Control 
                        type="file" 
                        id="upload-avatar" 
                        className="d-none" 
                        onChange={handleAvatarChange} 
                        accept="image/*"
                    />
                </div>
                <h5 className="mt-3">{user?.email}</h5>
                <span className="badge bg-info text-dark">{user?.role}</span>
              </div>

              {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={nome} 
                        onChange={e => setNome(e.target.value)} 
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Nova Senha (Deixe em branco para não mudar)</Form.Label>
                    <Form.Control 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="********"
                    />
                </Form.Group>

                <div className="d-grid">
                    <Button variant="primary" size="lg" type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
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