import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/useLoading';
import '../styles/home.css';

const LoginRegisterModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  
  // 1. Importamos 'register' además de 'login' desde el AuthContext actualizado
  const { login, register } = useAuth();
  
  const navigate = useNavigate();
  const { showLoading } = useLoading();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // 2. Usamos la función login del contexto (ahora es async)
    // El backend devuelve éxito o fallo, ya no necesitamos lógica de admin aquí si el contexto la maneja
    // (Aunque puedes mantener la redirección específica si lo prefieres)
    const success = await login(formData.email, formData.password);
    
    if (success) {
      // Verificamos si es admin directamente desde el email (o usando la propiedad isAdmin del contexto si la expusiste)
      if (formData.email.toLowerCase() === 'admin@admin.cl') {
          showLoading({ message: 'Entrando al panel...', duration: 5000 });
          navigate('/admin');
      } else {
          showLoading({ message: 'Iniciando sesión...', duration: 2000 });
          navigate('/perfil');
      }
      onClose();
      setFormData({ email: '', password: '', name: '' });
    }
    // Si falla, el AuthContext ya muestra un alert, o puedes setear error aquí si el login retornara el mensaje.
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setError('Por favor completa todos los campos');
      return;
    }

    // 3. CAMBIO CLAVE: Usamos la función 'register' real del contexto
    // Pasamos los argumentos individuales como definimos en el AuthContext
    const success = await register(formData.name, formData.email, formData.password);

    if (success) {
      showLoading({ message: 'Cuenta creada con éxito...', duration: 2000 });
      onClose();
      setFormData({ email: '', password: '', name: '' });
      navigate('/perfil');
    } else {
      // El AuthContext maneja el alert de error, pero podrías poner un mensaje genérico aquí
      setError('No se pudo crear la cuenta. Intenta con otro email.');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Ingresar
          </button>
          <button
            className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Registrarse
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="text"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Contraseña</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="modal-submit-btn">Ingresar</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2>Crear Cuenta</h2>
              <div className="form-group">
                <label htmlFor="register-name">Nombre</label>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Contraseña</label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="modal-submit-btn">Registrarse</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterModal;