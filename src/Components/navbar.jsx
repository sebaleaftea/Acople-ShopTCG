import "../styles/home.css"; // Import styles for nav
import { Link } from "react-router-dom";
import { useState } from "react";
import logoAcople from "../assets/images/logo_acople.png";
import { useAuth } from "../contexts/AuthContext";
import LoginRegisterModal from "./LoginRegisterModal";
import ProfileDropdown from "./ProfileDropdown";

export default function AppNavbar() {
  const { isLoggedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header role="banner">
        <div className="brand">
          <img src={logoAcople} alt="Logo Acople TCG" className="logo" />
          <p className="tagline">
            <span className="tagline-text">Mercado de cartas TCG</span>
          </p>
        </div>

        <nav aria-label="Navegación principal">
          <ul>
            <div className="nav-center">
              <li><Link to="/" data-nav>Inicio</Link></li>
              <li><Link to="/all-products" data-nav>Productos</Link></li>
              {isLoggedIn && (
                <li><Link to="/historial" data-nav>Historial de Compras</Link></li>
              )}
              <li><Link to="/blog" data-nav>Guía & Estrategias</Link></li>
            </div>
            <div className="nav-right">
              {isLoggedIn ? (
                <li className="profile-container">
                  <button
                    onClick={handleProfileClick}
                    className="profile-icon-btn"
                    data-nav
                    aria-label="Perfil de usuario"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </button>
                  {isDropdownOpen && <ProfileDropdown onClose={closeDropdown} />}
                </li>
              ) : (
                <li>
                  <button onClick={handleLoginClick} className="login-btn" data-nav>
                    Ingresar
                  </button>
                </li>
              )}
            </div>
          </ul>
        </nav>
      </header>

      <LoginRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
