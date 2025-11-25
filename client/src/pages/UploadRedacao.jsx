import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function UploadRedacao() {
  const [tema, setTema] = useState('');
  const [file, setFile] = useState(null); 
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useAuth(); 
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!file) {
      setError('Por favor, selecione um arquivo de imagem.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('tema', tema); 
    formData.append('imagem', file); 

    try {
      const response = await axios.post(
        'http://localhost:3001/api/redacoes/upload', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data', 
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      setLoading(false);
      setMessage(response.data.message);
      
      setTema('');
      setFile(null);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Erro ao enviar redação.');
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      
      <div style={{ width: '30rem' }}>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => navigate('/dashboard')} 
          className="mb-3" 
        >
          &larr; Voltar ao Dashboard
        </Button>
      </div>

      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Enviar Redação</h2>
          
          <Form onSubmit={handleSubmit}>
            
            <Form.Group className="mb-3" controlId="formTema">
              <Form.Label>Tema da Redação</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ex: Desafios da educação..." 
                value={tema}
                onChange={(e) => setTema(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formImagem">
              <Form.Label>Imagem da Redação (PNG ou JPG)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange}
                required 
              />
            </Form.Group>
            
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Enviar'
              )}
            </Button>
          </Form>
          
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UploadRedacao;