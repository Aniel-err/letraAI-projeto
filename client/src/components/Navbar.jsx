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
          <Nav className="me-auto mb-2 mb-lg-0 mt-3 mt-lg-0">
            <Nav.Link as={Link} to="/dashboard" className="fw-semibold">Dashboard</Nav.Link>
            
            {user.role === 'professor' ? (
                <Nav.Link as={Link} to="/turmas" className="fw-semibold">Minhas Turmas</Nav.Link>
            ) : (
                <Nav.Link as={Link} to="/turmas" className="fw-semibold">Turmas Disponíveis</Nav.Link>
            )}
          </Nav>

          <hr className="d-lg-none text-secondary" />

          <Nav className="align-items-start align-items-lg-center gap-3 mt-2 mt-lg-0">
            <div className="d-flex align-items-center gap-2">
                <Button 
                    variant={theme === 'light' ? 'outline-dark' : 'outline-light'} 
                    onClick={toggleTheme} 
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                >
                   {theme === 'light' ? '🌙' : '☀️'}
                </Button>
                <span className="d-lg-none fw-bold text-body-secondary ms-2">Alterar Tema</span>
            </div>

            <Dropdown align="end" className="w-100 w-lg-auto mt-2 mt-lg-0">
              <Dropdown.Toggle variant="transparent" className="d-flex align-items-center border-0 p-0 shadow-none w-100">
                <div 
                    className="d-flex justify-content-center align-items-center bg-primary text-white fw-bold rounded-circle me-2 shadow-sm flex-shrink-0"
                    style={{ width: '35px', height: '35px', fontSize: '14px' }}
                >
                    {getInitials(user.nome)}
                </div>
                <span style={{ color: 'var(--app-text)', fontWeight: 'bold' }}>{user.nome}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-100 border-0 shadow-sm mt-2">
                <Dropdown.Header>Perfil: {user.role}</Dropdown.Header>
                <Dropdown.Item as={Link} to="/perfil">Meu Perfil</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold">Sair do Sistema</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;