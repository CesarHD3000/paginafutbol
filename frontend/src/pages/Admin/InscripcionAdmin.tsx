import React, { useEffect, useState } from 'react';
import { fetchCategorias, fetchClubes, fetchEquiposPorCategoria, createEquipo, deleteEquipo } from '../../services/api';
import './AdminEntity.css';

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

  // Filtrar clubes que aún NO están inscritos en esta categoría
  const clubesDisponibles = clubes.filter(c => 
    !equiposInscritos.some(ei => ei.nombre === c.nombre)
  );

  return (
    <div className="admin-entity-container">
      <header className="entity-header">
        <h1>Inscripciones por Categoría</h1>
        <p>Vincula los clubes a las categorías donde competirán</p>
      </header>

      <section className="category-selector-section">
        <label>Seleccionar Categoría:</label>
        <select 
          value={selectedCategoria} 
          onChange={(e) => setSelectedCategoria(e.target.value)}
          className="admin-select"
        >
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </section>

      <div className="inscription-grid">
        <section className="inscription-column">
          <h3>Clubes Inscritos</h3>
          <div className="inscription-list">
            {equiposInscritos.length === 0 ? <p className="empty-msg">No hay clubes inscritos en esta categoría</p> : 
              equiposInscritos.map(ei => (
                <div key={ei.equipo_id} className="inscription-item">
                  <img src={ei.logo_url} alt="" />
                  <span>{ei.nombre}</span>
                  <button onClick={() => handleEliminarInscripcion(ei.equipo_id)} className="remove-btn">QUITAR</button>
                </div>
              ))
            }
          </div>
        </section>

        <section className="inscription-column">
          <h3>Clubes Disponibles</h3>
          <div className="inscription-list">
            {clubesDisponibles.length === 0 ? <p className="empty-msg">Todos los clubes están inscritos</p> : 
              clubesDisponibles.map(c => (
                <div key={c.id} className="inscription-item">
                  <img src={c.logo_url} alt="" />
                  <span>{c.nombre}</span>
                  <button onClick={() => handleInscribir(c.id)} className="add-btn">INSCRIBIR</button>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
};

export default InscripcionAdmin;
