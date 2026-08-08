import React, { useEffect, useState } from 'react';
import { 
  fetchRecientes, 
  fetchProximos, 
  deletePartido, 
  fetchCategorias, 
  fetchEquiposPorCategoria,
  createPartido 
} from '../../services/api';
import './MatchAdmin.css';

const MatchAdmin: React.FC = () => {
  const [proximos, setProximos] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoriaId, setCategoriaId] = useState('');
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('Estadio Municipal de Putaendo');

  const loadData = async () => {
    try {
      const [prox, rec, cats] = await Promise.all([
        fetchProximos(), 
        fetchRecientes(),
        fetchCategorias()
      ]);
      setProximos(prox);
      setRecientes(rec);
      setCategorias(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (categoriaId) {
      fetchEquiposPorCategoria(parseInt(categoriaId)).then(setEquipos);
    }
  }, [categoriaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localId === visitanteId) return alert('Los equipos deben ser diferentes');
    try {
      await createPartido({
        categoria_id: categoriaId,
        equipo_local_id: localId,
        equipo_visitante_id: visitanteId,
        fecha: `${fecha}T${hora}`,
        lugar
      });
      loadData();
      alert('Partido programado exitosamente');
      setLocalId('');
      setVisitanteId('');
    } catch (err) {
      alert('Error al programar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este partido?')) {
      await deletePartido(id);
      loadData();
    }
  };

  const EmptyState = () => (
    <div className="empty-state-card">
      <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12h8"></path>
        <path d="M12 8v8"></path>
      </svg>
      <h4>No hay partidos programados</h4>
      <p>Programa un nuevo encuentro para comenzar a gestionar la liga.</p>
    </div>
  );

  if (loading) return <div className="match-admin-container"><p>Cargando gestión de partidos...</p></div>;

  return (
    <div className="match-admin-container">
      <div className="match-admin-content">
        
        <header className="match-admin-header">
          <h1>Gestión de Partidos</h1>
          <p>Planifica la jornada deportiva y administra los encuentros.</p>
        </header>

        <section className="admin-card">
          <h3>Programar Nuevo Partido</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group full-width">
              <label>Categoría</label>
              <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                <option value="">Seleccione una categoría de la liga</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Equipo Local</label>
              <select value={localId} onChange={(e) => setLocalId(e.target.value)} disabled={!categoriaId} required>
                <option value="">Seleccione Local</option>
                {equipos.map(e => <option key={e.equipo_id} value={e.equipo_id}>{e.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Equipo Visitante</label>
              <select value={visitanteId} onChange={(e) => setVisitanteId(e.target.value)} disabled={!categoriaId} required>
                <option value="">Seleccione Visitante</option>
                {equipos.map(e => <option key={e.equipo_id} value={e.equipo_id}>{e.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha del Encuentro</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>

            <div className="form-group full-width">
              <label>Lugar / Estadio</label>
              <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="Ej: Estadio Municipal" required />
            </div>

            <button type="submit" className="btn-submit">PROGRAMAR ENCUENTRO</button>
          </form>
        </section>

        <div className="list-section-header">
          <h2>Partidos Próximos</h2>
        </div>

        <section className="match-list-wrapper">
          {proximos.length === 0 ? (
            <EmptyState />
          ) : (
            proximos.map(p => (
              <div key={p.id} className="match-admin-item">
                <div className="match-admin-info">
                  <span style={{color: 'var(--accent-red)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'}}>{p.categoria_nombre}</span>
                  <div className="match-admin-teams">
                    {p.local} <span style={{color: 'rgba(255,255,255,0.2)', fontWeight: '400', margin: '0 8px'}}>vs</span> {p.visitante}
                  </div>
                  <div className="match-admin-meta">
                    <span>📅 {new Date(p.fecha).toLocaleDateString()}</span>
                    <span>⏰ {new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hrs</span>
                  </div>
                </div>
                <div className="match-admin-actions">
                  <button className="btn-action-outline" onClick={() => window.location.href=`/admin/partido/${p.id}`}>GESTIONAR</button>
                  <button className="btn-delete-small" onClick={() => handleDelete(p.id)} title="Eliminar">×</button>
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  );
};

export default MatchAdmin;
