import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // Se tem usuário, mostra a rota (Outlet). Se não, manda pro Login.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;