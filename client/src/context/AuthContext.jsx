import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('letral_token'));

  useEffect(() => {
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const decodedToken = jwtDecode(token); 

        setUser({
          id: decodedToken.id,
          email: decodedToken.email,
          role: decodedToken.role,
          nome: decodedToken.nome || 'Usuário' 
        });

      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem('letral_token'); 
        setToken(null);
        setUser(null);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]); 

  const login = (newToken, userData) => {
    localStorage.setItem('letral_token', newToken);
    setToken(newToken); 
    setUser({
      ...userData,
      nome: userData.nome || 'Usuário'
    });
  };

  const logout = () => {
    localStorage.removeItem('letral_token');
    setToken(null); 
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};