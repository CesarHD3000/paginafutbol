import React, { useEffect, useState } from 'react';
import { fetchCategorias, fetchClubes, fetchEquiposPorCategoria, createEquipo, deleteEquipo, getImageUrl } from '../../services/api';
import './InscripcionAdmin.css';

const InscripcionAdmin: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [clubes, setClubes] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [equiposInscritos, setEquiposInscritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {
    try {
      const [cats, cls] = await Promise.all([fetchCategorias(), fetchClubes()]);
      setCategorias(cats);
      setClubes(cls);
      if (cats.length > 0) setSelectedCategoria(cats[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInscritos = async (catId: string) => {
    if (!catId) return;
    try {
      const data = await fetchEquiposPorCategoria(parseInt(catId));
      setEquiposInscritos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategoria) loadInscritos(selectedCategoria);
  }, [selectedCategoria]);

  const handleInscribir = async (clubId: number) => {
    try {
      await createEquipo({ club_id: clubId, categoria_id: parseInt(selectedCategoria) });
      loadInscritos(selectedCategoria);
    } catch (err: any) {
      alert(err.message || 'Error al inscribir club');
    }
  };

  const handleEliminarInscripcion = async (equipoId: number) => {
    if (!confirm('¿Eliminar esta inscripción? El club dejará de aparecer en la tabla de posiciones de esta categoría.')) return;
    try {
      await deleteEquipo(equipoId);
      loadInscritos(selectedCategoria);
    } catch (err) {
      alert('Error al eliminar inscripción. Verifique que el equipo no tenga partidos registrados.');
    }
  };

  if (loading) return <div className="loading">Cargando datos...</div>;

  const clubesDisponibles = clubes.filter(c => 
    !equiposInscritos.some(ei => ei.nombre === c.nombre)
  );

  return (
    <div className="inscripcion-container">
      <div className="inscripcion-content">
        <header className="inscripcion-header">
          <h1>Inscripciones por Categoría</h1>
          <p>Gestiona la vinculación de clubes a las categorías de competición oficial</p>
        </header>

        <section className="category-select-wrapper">
          <label>Categoría Seleccionada</label>
          <select 
            value={selectedCategoria} 
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="modern-select"
          >
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </section>

        <div className="dashboard-grid">
          {/* COLUMNA IZQUIERDA: INSCRITOS */}
          <section className="dashboard-card">
            <h3>Clubes Inscritos</h3>
            <div className="club-list">
              {equiposInscritos.length === 0 ? (
                <p className="empty-state">No hay clubes registrados en esta categoría</p>
              ) : (
                equiposInscritos.map(ei => (
                  <div key={ei.equipo_id} className="club-item">
                    <div className="club-info">
                      <img src={getImageUrl(ei.logo_path)} alt="" className="club-logo" />
                      <span className="club-name">{ei.nombre}</span>
                    </div>
                    <button 
                      onClick={() => handleEliminarInscripcion(ei.equipo_id)} 
                      className="btn-modern btn-quitar"
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA: DISPONIBLES */}
          <section className="dashboard-card">
            <h3>Clubes Disponibles</h3>
            <div className="club-list">
              {clubesDisponibles.length === 0 ? (
                <p className="empty-state">Todos los clubes han sido inscritos</p>
              ) : (
                clubesDisponibles.map(c => (
                  <div key={c.id} className="club-item">
                    <div className="club-info">
                      <img src={getImageUrl(c.logo_path)} alt="" className="club-logo" />
                      <span className="club-name">{c.nombre}</span>
                    </div>
                    <button 
                      onClick={() => handleInscribir(c.id)} 
                      className="btn-modern btn-inscribir"
                    >
                      Inscribir
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InscripcionAdmin;
