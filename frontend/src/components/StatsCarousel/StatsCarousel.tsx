import React from 'react';
import { Link } from 'react-router-dom';
import './StatsCarousel.css';

interface EquipoTabla {
  id: number;
  nombre: string;
  logo_url: string;
  puntos: number;
  partidos_jugados: number;
}

interface StatsCarouselProps {
  equipos: EquipoTabla[];
}

const StatsCarousel: React.FC<StatsCarouselProps> = ({ equipos }) => {
  return (
    <section className="stats-carousel-section">
      <div className="stats-container">
        <h2 className="stats-title">CLASIFICACIÓN</h2>
        
        <div className="stats-slider">
          {equipos.map((equipo, index) => (
            <Link key={equipo.id} to={`/club/${equipo.id}`} className="stats-card">
              <span className="stats-rank">{index + 1}.</span>
              <div className="stats-logo-box">
                <img src={equipo.logo_url || 'https://via.placeholder.com/60'} alt={equipo.nombre} className="stats-logo" />
              </div>
              <h3 className="stats-name">{equipo.nombre}</h3>
              <span className="stats-pts">{equipo.puntos} Pts</span>
            </Link>
          ))}
        </div>

        <div className="stats-footer">
          <Link to="/stats" className="full-stats-link">
            CLASIFICACIÓN COMPLETA →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StatsCarousel;
