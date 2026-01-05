import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from "jwt-decode"; 
import api from '../services/api'; 

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          sessionStorage.removeItem('token');
          return null;
        }
        
        return { ...decoded, token }; 
      } catch (error) {
        console.error("Token inválido no storage", error);
        sessionStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const login = (token, userData) => {
    sessionStorage.setItem('token', token);
    
    if (!userData) {
      try {
        const decoded = jwtDecode(token);
        setUser({ ...decoded, token });
      } catch (error) {
        console.error("Erro no token:", error);
        sessionStorage.removeItem('token'); 
        setUser(null);
      }
    } else {
      setUser({ ...userData, token });
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
        const response = await api.get('/auth/me');
        const token = sessionStorage.getItem('token');
        
        if (token && response.data) {
            setUser({ ...response.data, token });
        }
    } catch (error) {
        console.error("Erro ao atualizar sessão do usuário", error);
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}