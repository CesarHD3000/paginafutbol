import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import './UpcomingCard.css';

interface Partido {
  id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  local: string;
  visitante: string;
  local_logo: string;
  visitante_logo: string;
  fecha: string;
}

interface UpcomingCardProps {
  partido: Partido;
}

const UpcomingCard: React.FC<UpcomingCardProps> = ({ partido }) => {
  const fechaObj = new Date(partido.fecha);
  const dia = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
  const hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="upcoming-card">
      <span className="upcoming-time">{dia} - {hora}</span>
      
      <div className="upcoming-logos-box">
        <Link to={`/club/${partido.equipo_local_id}`}>
          <img src={getImageUrl(partido.local_logo)} alt={partido.local} className="upcoming-logo local" />
        </Link>
        <span className="upcoming-vs-badge">VS</span>
        <Link to={`/club/${partido.equipo_visitante_id}`}>
          <img src={getImageUrl(partido.visitante_logo)} alt={partido.visitante} className="upcoming-logo visitante" />
        </Link>
      </div>

      <div className="upcoming-names">
        <Link to={`/club/${partido.equipo_local_id}`} className="upcoming-name-text">{partido.local}</Link>
        <Link to={`/club/${partido.equipo_visitante_id}`} className="upcoming-name-text">{partido.visitante}</Link>
      </div>

      <span className="upcoming-status">PROGRAMADO</span>
    </div>
  );
};

export default UpcomingCard;
