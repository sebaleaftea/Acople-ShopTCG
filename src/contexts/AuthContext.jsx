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

  // Al cargar la app, verificamos si hay una sesión guardada
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

  // Función de Login conectada al Backend
  const login = async (email, password) => {
    try {
      // Hacemos la petición POST al endpoint de tu backend
      const response = await api.post('/auth/login', { email, password });

      // Tu backend devuelve la estructura: { data: { user: {...}, token: "..." } }
      // Extraemos usuario y token
      const { user: userData, token } = response.data.data;

      // Combinamos los datos del usuario con el token para tener todo junto
      const userWithToken = { ...userData, token };

      // Guardamos en el estado y en localStorage
      setUser(userWithToken);
      localStorage.setItem('acople-user', JSON.stringify(userWithToken));
      
      return true; // Login exitoso
    } catch (error) {
      // Capturamos el mensaje de error que envía tu backend (ej: "Credenciales inválidas")
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      console.error('Login error:', message);
      alert(message); // Feedback simple para el usuario
      return false; // Login fallido
    }
  };

  // Función de Registro conectada al Backend
  const register = async (name, email, password) => {
    try {
      // El backend espera { name, email, password } y asigna rol 'customer' por defecto
      const response = await api.post('/auth/register', { name, email, password });

      const { user: userData, token } = response.data.data;
      const userWithToken = { ...userData, token };

      setUser(userWithToken);
      localStorage.setItem('acople-user', JSON.stringify(userWithToken));
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse';
      console.error('Register error:', message);
      alert(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acople-user');
    // Opcional: Redirigir al home si es necesario
    window.location.href = '/'; 
  };

  // Función para actualizar datos locales (si editas perfil)
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
    register, // Exponemos la nueva función register
    logout,
    updateProfile,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin' // Helper útil para proteger rutas
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};