import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { token } = useAuth(); 

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;