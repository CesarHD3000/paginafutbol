import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronizar estado de admin cada vez que cambie la ruta o el almacenamiento
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      
      setUser(userData);
      setIsAdmin(!!(token && userData && userData.role === 'admin'));
    };

    checkAuth();
    
    // Escuchar cambios de storage (por si se loguea en otra pestaña)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]); // Se ejecuta cada vez que cambiamos de página

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdmin(false);
    setUser(null);
    setShowAdminMenu(false);
    navigate('/');
  };

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
          
          <Link to="/admin" className="admin-btn" title={isAdmin ? `Sesión iniciada como ${user.username}` : "Acceso Administrativo"}>
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
