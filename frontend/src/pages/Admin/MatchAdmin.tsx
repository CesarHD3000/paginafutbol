import React, { useEffect, useState } from 'react';
import { fetchRecientes, fetchProximos, deletePartido } from '../../services/api';
import './MatchAdmin.css';

const MatchAdmin: React.FC = () => {
  const [proximos, setProximos] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPartidos = async () => {
    try {
      const [prox, rec] = await Promise.all([fetchProximos(), fetchRecientes()]);
      setProximos(prox);
      setRecientes(rec);
    } catch (err) {
      console.error('Error al cargar partidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartidos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar partido?')) return;
    try {
      await deletePartido(id);
      loadPartidos();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // Componente Reutilizable de Estado Vacío
  const EmptyState = ({ title, subtitle, icon, showAction = true }: { title: string, subtitle: string, icon: string, showAction?: boolean }) => (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
      {showAction && (
        <button className="btn-cta" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          Programar Partido
        </button>
      )}
    </div>
  );

  if (loading) return <div className="match-admin-container"><p>Cargando panel de partidos...</p></div>;

  return (
    <div className="match-admin-container">
      <div className="match-admin-content">
        
        {/* SECCIÓN 1: PENDIENTES / EN VIVO */}
        <section>
          <header className="section-header">
            <h2>Partidos por Jugar / En Vivo</h2>
          </header>
          
          {proximos.length === 0 ? (
            <EmptyState 
              icon="⚽"
              title="No hay partidos programados"
              subtitle="Cuando se programen nuevos encuentros, aparecerán aquí para su gestión y seguimiento en vivo."
            />
          ) : (
            <div className="match-grid">
              {proximos.map(p => (
                <div key={p.id} className="match-admin-card">
                  {/* Aquí iría el render de la card de partido que ya tienes */}
                  <div style={{padding: '20px', background: '#1a1f26', borderRadius: '12px', display: 'flex', justifyContent: 'space-between'}}>
                    <span>{p.local} vs {p.visitante}</span>
                    <button onClick={() => handleDelete(p.id)} style={{color: '#ff3d3d', background: 'none', border: 'none', cursor: 'pointer'}}>ELIMINAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN 2: FINALIZADOS */}
        <section>
          <header className="section-header">
            <h2>Partidos Finalizados</h2>
          </header>
          
          {recientes.length === 0 ? (
            <EmptyState 
              icon="🏆"
              title="Aún no hay resultados registrados"
              subtitle="Los partidos que hayan finalizado se listarán aquí con sus respectivos marcadores y estadísticas."
              showAction={false}
            />
          ) : (
            <div className="match-grid">
              {recientes.map(p => (
                <div key={p.id} className="match-admin-card">
                   <div style={{padding: '20px', background: '#1a1f26', borderRadius: '12px', display: 'flex', justifyContent: 'space-between'}}>
                    <span>{p.local} ({p.goles_local}) - ({p.goles_visitante}) {p.visitante}</span>
                    <button onClick={() => handleDelete(p.id)} style={{color: '#ff3d3d', background: 'none', border: 'none', cursor: 'pointer'}}>ELIMINAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default MatchAdmin;
