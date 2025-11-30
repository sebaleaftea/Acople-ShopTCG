import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importamos el contexto
import '../styles/home.css';

export default function AppFooter() {
  // Extraemos la propiedad isAdmin que creamos en el AuthContext
  const { isAdmin } = useAuth();

  return (
    <footer>
      <p>© 2025 Acople TCG. Todos los derechos reservados.</p>
      
      {/* Renderizado Condicional: Solo se muestra si es Admin */}
      {isAdmin && (
        <div style={{ marginTop: '10px' }}>
          <Link to="/admin" className="footer-admin-btn">
            Panel de Administración
          </Link>
        </div>
      )}
    </footer>
  );
}