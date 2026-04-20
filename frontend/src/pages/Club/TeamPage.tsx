import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEquipoPublico } from '../../services/api';
import './TeamPage.css';

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      if (!id) return;
      try {
        const res = await fetchEquipoPublico(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!data) return <div className="error-container">Equipo no encontrado</div>;

  const { equipo, jugadores, partidos } = data;

  return (
    <div className="team-page-container">
      <header className="team-page-hero">
        <div className="hero-blur" style={{ backgroundImage: `url(${equipo.logo_url})` }}></div>
        <div className="hero-content">
          <img src={equipo.logo_url} alt={equipo.nombre} className="team-page-logo" />
          <h1>{equipo.nombre}</h1>
          <p>Club de la Liga Putaendo</p>
        </div>
      </header>

      <div className="team-content-grid">
        <section className="team-section squad-section">
          <h2>PLANTILLA</h2>
          <div className="squad-grid">
            {jugadores.length > 0 ? (
              jugadores.map((j: any) => (
                <div key={j.id} className="player-card">
                  <div className="player-number">#{j.numero}</div>
                  <div className="player-img-box">
                    <img src={j.foto_url || 'https://via.placeholder.com/150'} alt={j.nombre} />
                  </div>
                  <div className="player-info">
                    <h4>{j.nombre}</h4>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">No hay jugadores registrados.</p>
            )}
          </div>
        </section>

        <section className="team-section matches-section">
          <h2>CALENDARIO Y RESULTADOS</h2>
          <div className="team-match-list">
            {partidos.length > 0 ? (
              partidos.map((p: any) => (
                <div key={p.id} className={`team-match-item ${p.estado}`}>
                  <div className="tm-meta">
                    <span className="tm-date">{new Date(p.fecha).toLocaleDateString()}</span>
                    <span className="tm-status">{p.estado.toUpperCase()}</span>
                  </div>
                  <div className="tm-teams">
                    <div className="tm-team local">
                      <span className={p.equipo_local_id === equipo.id ? 'is-me' : ''}>{p.local}</span>
                      <img src={p.local_logo} alt={p.local} />
                    </div>
                    <div className="tm-score">
                      {p.estado === 'pendiente' ? 'VS' : `${p.goles_local} - ${p.goles_visitante}`}
                    </div>
                    <div className="tm-team visitante">
                      <img src={p.visitante_logo} alt={p.visitante} />
                      <span className={p.equipo_visitante_id === equipo.id ? 'is-me' : ''}>{p.visitante}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">No hay partidos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;
