import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setShowAdminMenu(false);
  }, [location]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <img src="/PutaendoLogo.png" alt="Putaendo Logo" className="logo-small" />
          <Link to="/">LIGA<span>PUTAENDO</span></Link>
        </div>
        
        <ul className="nav-links">
          <li><Link to="/">Portada</Link></li>
          <li><Link to="/partidos">Partidos</Link></li>
          <li><Link to="/stats">Clasificación</Link></li>
          <li><Link to="/clubes">Clubes</Link></li>
          <li><Link to="/live" className="live-link">En Vivo</Link></li>
        </ul>

        <div className="nav-actions">
          <img src="/LOGO-ARFA-scaled.png" alt="ARFA Logo" className="logo-arfa" />
          
          {/* Solo mostramos el menú de gestión si hay token (sesión activa) */}
          {token && (
            <div className="admin-menu-wrapper" ref={menuRef}>
              <button 
                className={`admin-menu-trigger ${showAdminMenu ? 'active' : ''}`}
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                title="Menú de Gestión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>

              {showAdminMenu && (
                <div className="admin-dropdown">
                  <div className="dropdown-header">Gestión Administrativa</div>
                  <Link to="/admin" className="dropdown-item">
                    <i>🏠</i> Panel Principal
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/admin/clubes" className="dropdown-item">
                    <i>🛡️</i> Gestionar Clubes
                  </Link>
                  <Link to="/admin/categorias" className="dropdown-item">
                    <i>🏆</i> Gestionar Categorías
                  </Link>
                  <Link to="/admin/inscripciones" className="dropdown-item">
                    <i>📝</i> Gestionar Inscripciones
                  </Link>
                  <Link to="/admin/jugadores" className="dropdown-item">
                    <i>🏃</i> Gestionar Jugadores
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link to="/admin" className="admin-btn" title="Perfil Admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
