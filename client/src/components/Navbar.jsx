import React from 'react';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function AppNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

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
            {/* Botão de Tema */}
            <Button 
                variant={theme === 'light' ? 'outline-dark' : 'outline-light'} 
                onClick={toggleTheme} 
                className="d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
               {theme === 'light' ? '🌙' : '☀️'}
            </Button>

            {/* Perfil */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="transparent" className="d-flex align-items-center border-0 p-0">
                {user.avatar && (
                    <img src={user.avatar} alt="Avatar" className="rounded-circle me-2" style={{width: 35, height: 35, objectFit: 'cover'}} />
                )}
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