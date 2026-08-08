import React, { useEffect, useState } from 'react';
import { fetchProximos, fetchRecientes, fetchCategorias, getImageUrl } from '../../services/api';
import './MatchesPage.css';

const MatchesPage: React.FC = () => {
  const [proximos, setProximos] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'proximos' | 'resultados'>('proximos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [cats, prox, rec] = await Promise.all([
          fetchCategorias(),
          fetchProximos(),
          fetchRecientes()
        ]);
        setCategorias(cats);
        setProximos(prox);
        setRecientes(rec);
      } catch (err) {
        console.error('Error cargando partidos:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const filterMatches = async () => {
      setLoading(true);
      try {
        const [prox, rec] = await Promise.all([
          fetchProximos(activeCategory || undefined),
          fetchRecientes(activeCategory || undefined)
        ]);
        setProximos(prox);
        setRecientes(rec);
      } catch (err) {
        console.error('Error filtrando partidos:', err);
      } finally {
        setLoading(false);
      }
    };
    filterMatches();
  }, [activeCategory]);

  const MatchCard = ({ match, type }: { match: any, type: 'proximo' | 'resultado' }) => {
    const dateObj = new Date(match.fecha);
    const dateStr = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="public-match-card">
        <div className="category-badge">{match.categoria_nombre}</div>
        
        <div className="match-teams-layout">
          <div className="team-display">
            <img src={getImageUrl(match.local_logo)} alt={match.local} />
            <span>{match.local}</span>
          </div>

          <div className="vs-score-center">
            {type === 'resultado' ? (
              <div className="score-display">
                <span className={`score-num ${match.goles_local > match.goles_visitante ? 'winner' : ''}`}>
                  {match.goles_local}
                </span>
                <span className="score-sep">-</span>
                <span className={`score-num ${match.goles_visitante > match.goles_local ? 'winner' : ''}`}>
                  {match.goles_visitante}
                </span>
              </div>
            ) : (
              <span className="vs-text">VS</span>
            )}
          </div>

          <div className="team-display">
            <img src={getImageUrl(match.visitante_logo)} alt={match.visitante} />
            <span>{match.visitante}</span>
          </div>
        </div>

        <div className="match-footer">
          <div className="footer-item">
            <span>📅</span>
            <span>{dateStr}</span>
          </div>
          <div className="footer-item">
            <span>⏰</span>
            <span>{timeStr} hrs</span>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="empty-matches-container">
      <svg className="empty-matches-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12h8"></path>
        <path d="M12 8v8"></path>
      </svg>
      <h3>No hay partidos disponibles</h3>
      <p>Intenta seleccionando otra categoría o vuelve más tarde.</p>
    </div>
  );

  return (
    <div className="matches-page-container">
      <div className="matches-content">
        <header className="page-header">
          <h1>Programación y Resultados</h1>
          <p>La emoción del fútbol local en un solo lugar</p>
        </header>

        <div className="categories-filter-scroll">
          <button 
            className={`filter-chip ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            Todas las Categorías
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <div className="tab-selector-container">
          <div className="tab-selector">
            <button 
              className={`tab-btn ${activeTab === 'proximos' ? 'active' : ''}`}
              onClick={() => setActiveTab('proximos')}
            >
              Próximos
            </button>
            <button 
              className={`tab-btn ${activeTab === 'resultados' ? 'active' : ''}`}
              onClick={() => setActiveTab('resultados')}
            >
              Resultados
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '100px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
            SINCRONIZANDO PARTIDOS...
          </div>
        ) : (
          <div className="matches-grid">
            {activeTab === 'proximos' ? (
              proximos.length > 0 ? (
                proximos.map(m => <MatchCard key={m.id} match={m} type="proximo" />)
              ) : (
                <EmptyState />
              )
            ) : (
              recientes.length > 0 ? (
                recientes.map(m => <MatchCard key={m.id} match={m} type="resultado" />)
              ) : (
                <EmptyState />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
