import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProximos, fetchRecientes } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [proximos, setProximos] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const [p, r] = await Promise.all([fetchProximos(), fetchRecientes()]);
        setProximos(p);
        setRecientes(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  if (loading) return <div className="loading">Cargando panel...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Selecciona un partido para gestionar eventos y resultados</p>
        <div className="admin-quick-actions">
          <Link to="/admin/clubes" className="quick-manage-btn">GESTIONAR CLUBES</Link>
          <Link to="/admin/categorias" className="quick-manage-btn">GESTIONAR CATEGORÍAS</Link>
          <Link to="/admin/inscripciones" className="quick-manage-btn">GESTIONAR INSCRIPCIONES</Link>
          <Link to="/admin/jugadores" className="quick-manage-btn">GESTIONAR JUGADORES</Link>
        </div>
      </header>

      <div className="admin-sections">
        <section className="admin-section">
          <h2>Partidos por Jugar / En Vivo</h2>
          <div className="admin-match-list">
            {proximos.map(m => (
              <div key={m.id} className="admin-match-item">
                <div className="match-brief">
                  <span>{m.local} vs {m.visitante}</span>
                  <span className="match-date-small">{new Date(m.fecha).toLocaleDateString()}</span>
                </div>
                <Link to={`/admin/partido/${m.id}`} className="manage-btn">GESTIONAR</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Partidos Finalizados</h2>
          <div className="admin-match-list">
            {recientes.map(m => (
              <div key={m.id} className="admin-match-item">
                <div className="match-brief">
                  <span>{m.local} {m.goles_local} - {m.goles_visitante} {m.visitante}</span>
                </div>
                <Link to={`/admin/partido/${m.id}`} className="manage-btn secondary">VER EVENTOS</Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
