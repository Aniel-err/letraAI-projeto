import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from "jwt-decode"; 

const AuthContext = createContext();

// Adicionamos esta linha para o Vite parar de reclamar do Fast Refresh
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  
  // --- 1. INICIALIZAÇÃO TARDIA (Lazy Initialization) ---
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Se o token venceu: limpamos
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          return null;
        }
        
        // Se o token é válido: começamos logados
        return decoded;
      } catch (error) {
        console.error("Token inválido no storage", error);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  // Removemos o "loading" e "setLoading" pois a checagem acima é instantânea
  // Não precisamos mais fazer o usuário esperar.

  // --- 2. FUNÇÕES DE LOGIN E LOGOUT ---

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    
    if (!userData) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Erro no token:", error);
        localStorage.removeItem('token'); 
        setUser(null);
      }
    } else {
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}