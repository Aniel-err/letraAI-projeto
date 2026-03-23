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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
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
                <div 
                    className="d-flex justify-content-center align-items-center bg-primary text-white fw-bold rounded-circle me-2 shadow-sm"
                    style={{ width: '35px', height: '35px', fontSize: '14px' }}
                >
                    {getInitials(user.nome)}
                </div>
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