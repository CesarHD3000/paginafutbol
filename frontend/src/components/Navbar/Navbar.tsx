import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => (
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
        <Link to="/admin" className="admin-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
