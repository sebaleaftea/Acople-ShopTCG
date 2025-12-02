/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../Api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('acople-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al analizar el usuario almacenado:', error);
        localStorage.removeItem('acople-user');
      }
    }
    setIsLoading(false);
  }, []);

  // --- LOGIN ADAPTADO A JAVA ---
  const login = async (emailOrUsername, password) => {
    try {
      // CORRECCIÓN 1: Backend Java espera 'username', no 'email'.
      // Mapeamos el input del usuario al campo 'username'.
      const response = await api.post('/auth/login', { 
        username: emailOrUsername, 
        password 
      });

      // CORRECCIÓN 2: Backend Java devuelve el objeto User directamente.
      // No hay 'data.data' ni 'token'.
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('acople-user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      console.error('Login error:', message);
      alert("Credenciales incorrectas");
      return false;
    }
  };

  // --- REGISTRO ADAPTADO A JAVA ---
  const register = async (name, email, password) => {
    try {
      // CORRECCIÓN 3: Adaptamos los campos al modelo User.java
      // User.java tiene: username, email, password, role
      const payload = {
        username: name, // Usamos el nombre como username
        email: email,
        password: password,
        role: 'customer' // Asignamos rol por defecto
      };

      const response = await api.post('/auth/register', payload);

      // Java devuelve el usuario creado directamente
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('acople-user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse';
      console.error('Register error:', message);
      alert("Error al registrarse. Verifica que el usuario no exista.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acople-user');
    window.location.href = '/'; 
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('acople-user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isLoggedIn: !!user,
    // CORRECCIÓN 4: Validación de rol simple (Java devuelve string "admin" o "customer")
    isAdmin: user?.role === 'admin' 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};