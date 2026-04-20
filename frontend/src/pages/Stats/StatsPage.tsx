import React, { useEffect, useState } from 'react';
import { fetchTabla, fetchCategorias } from '../../services/api';
import { Link } from 'react-router-dom';
import './StatsPage.css';

interface Category {
  id: number;
  nombre: string;
}

interface TeamStats {
  equipo_id: number;
  nombre: string;
  logo_url: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

const StatsPage: React.FC = () => {
  const [tabla, setTabla] = useState<TeamStats[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cats = await fetchCategorias();
        setCategorias(cats);
        if (cats.length > 0) {
          setSelectedCat(cats[0].id);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCat) return;

    const loadTabla = async () => {
      setLoading(true);
      try {
        const data = await fetchTabla(selectedCat);
        setTabla(data);
      } catch (err) {
        console.error('Error loading table:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTabla();
  }, [selectedCat]);

  return (
    <div className="stats-page-container">
      <header className="stats-page-header">
        <h1>Clasificación General</h1>
        <p>Temporada 2026 - Liga Putaendo</p>
      </header>

      {/* Selector de Categorías */}
      <div className="category-tabs">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${selectedCat === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Actualizando clasificación...</p>
          </div>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-team">Club</th>
                <th className="col-stat">PJ</th>
                <th className="col-stat">PG</th>
                <th className="col-stat">PE</th>
                <th className="col-stat">PP</th>
                <th className="col-stat hide-tablet">GF</th>
                <th className="col-stat hide-tablet">GC</th>
                <th className="col-stat hide-mobile">DG</th>
                <th className="col-stat col-pts">PTS</th>
              </tr>
            </thead>
            <tbody>
              {tabla.length > 0 ? (
                tabla.map((team, index) => {
                  const rank = index + 1;
                  const rankClass = rank <= 3 ? `rank-${rank}` : '';
                  
                  return (
                    <tr key={team.equipo_id} className={rankClass}>
                      <td className="col-rank">
                        <span className="rank-badge">{rank}</span>
                      </td>
                      <td className="col-team">
                        <div className="team-link">
                          <img src={team.logo_url || 'https://via.placeholder.com/30'} alt={team.nombre} />
                          <span className="team-name">{team.nombre}</span>
                        </div>
                      </td>
                      <td className="col-stat">{team.pj}</td>
                      <td className="col-stat">{team.pg}</td>
                      <td className="col-stat">{team.pe}</td>
                      <td className="col-stat">{team.pp}</td>
                      <td className="col-stat hide-tablet">{team.gf}</td>
                      <td className="col-stat hide-tablet">{team.gc}</td>
                      <td className="col-stat hide-mobile">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                      <td className="col-stat col-pts">{team.pts}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="empty-table">
                    No hay datos registrados para esta categoría todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
