import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import UploadRedacao from './pages/UploadRedacao';
import CorrecaoRedacao from './pages/CorrecaoRedacao'; 
import Turmas from './pages/Turmas';
import TurmaDetalhes from './pages/TurmaDetalhes';

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route 
          path="/login" 
          element={<PublicRoute><Login /></PublicRoute>} 
        />
        <Route 
          path="/cadastro" 
          element={<PublicRoute><Register /></PublicRoute>} 
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enviar-redacao" element={<UploadRedacao />} />
          <Route path="/redacao/:id" element={<CorrecaoRedacao />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/turma/:id" element={<TurmaDetalhes />} /> 
        </Route>

      </Routes>
    </Router>
  );
}

export default App;