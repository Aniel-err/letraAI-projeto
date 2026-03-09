import React from 'react';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function AppNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  const getFixedAvatarUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined') return defaultAvatar;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url; 
    try {
        const partes = url.replace(/\\/g, '/').split('/');
        const nomeArquivo = partes[partes.length - 1];
        if (!nomeArquivo || nomeArquivo === 'null') return defaultAvatar;
        
        const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : 'http://localhost:3001';
        return `${baseUrl}/uploads/${nomeArquivo}`;
    } catch { 
        return defaultAvatar; 
    }
  };

  if (!user) return null;

  return (
    <Navbar expand="lg" className="shadow-sm mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary" style={{ fontSize: '1.5rem' }}>
          LetraAi ✍️
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" className="fw-semibold">Dashboard</Nav.Link>
            
            {user.role === 'professor' ? (
                <Nav.Link as={Link} to="/turmas" className="fw-semibold">Minhas Turmas</Nav.Link>
            ) : (
                <Nav.Link as={Link} to="/turmas" className="fw-semibold">Turmas Disponíveis</Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            <Button 
                variant={theme === 'light' ? 'outline-dark' : 'outline-light'} 
                onClick={toggleTheme} 
                className="d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
               {theme === 'light' ? '🌙' : '☀️'}
            </Button>

            <Dropdown align="end">
              <Dropdown.Toggle variant="transparent" className="d-flex align-items-center border-0 p-0 shadow-none">
                <img 
                    src={getFixedAvatarUrl(user.avatar)} 
                    alt="Avatar" 
                    className="rounded-circle me-2 bg-light" 
                    style={{width: 35, height: 35, objectFit: 'cover'}} 
                    onError={(e) => {
                        e.currentTarget.onerror = null; // Bloqueia o loop
                        e.currentTarget.src = defaultAvatar;
                    }}
                />
                <span style={{ color: 'var(--app-text)', fontWeight: 'bold' }}>{user.nome}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>Perfil: {user.role}</Dropdown.Header>
                <Dropdown.Item as={Link} to="/perfil">Meu Perfil</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">Sair</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;