import React from 'react';
import { Link } from 'react-router-dom';
import './MatchCard.css';

interface Partido {
  id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  local: string;
  visitante: string;
  local_logo: string;
  visitante_logo: string;
  goles_local: number;
  goles_visitante: number;
  fecha: string;
  estado: 'pendiente' | 'en_vivo' | 'finalizado';
}

interface MatchCardProps {
  partido: Partido;
}

const MatchCard: React.FC<MatchCardProps> = ({ partido }) => {
  const isFinalizado = partido.estado === 'finalizado';
  const isEnVivo = partido.estado === 'en_vivo';

  return (
    <div className={`match-card ${isEnVivo ? 'is-live' : ''}`}>
      <div className="match-teams">
        <Link to={`/club/${partido.equipo_local_id}`} className="team-info clickable">
          <img src={partido.local_logo || 'https://via.placeholder.com/60'} alt={partido.local} className="team-logo" />
          <span className="team-name">{partido.local}</span>
        </Link>
        
        <div className="match-center">
          {isFinalizado ? (
            <div className="match-score">
              <span>{partido.goles_local}</span>
              <span className="score-divider">-</span>
              <span>{partido.goles_visitante}</span>
            </div>
          ) : (
            <div className="vs-container">
              <span className="vs-text">VS</span>
              {isEnVivo && <span className="live-indicator">LIVE</span>}
            </div>
          )}
        </div>

        <Link to={`/club/${partido.equipo_visitante_id}`} className="team-info clickable">
          <img src={partido.visitante_logo || 'https://via.placeholder.com/60'} alt={partido.visitante} className="team-logo" />
          <span className="team-name">{partido.visitante}</span>
        </Link>
      </div>

      <div className="match-meta">
        <span className={`match-status ${isEnVivo ? 'status-live' : ''}`}>
          {isEnVivo ? 'En Vivo' : isFinalizado ? 'Finalizado' : 'Próximamente'}
        </span>
        {!isFinalizado && !isEnVivo && (
          <span className="match-date">
            {new Date(partido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
