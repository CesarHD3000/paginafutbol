import React, { useEffect, useState } from 'react';
import { fetchClubes, createClub, updateClub, deleteClub, getImageUrl } from '../../services/api';
import './AdminEntity.css';

const ClubAdmin: React.FC = () => {
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [colorPrincipal, setColorPrincipal] = useState('#ff3d3d');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>(null);

  const loadClubes = async () => {
    try {
      const data = await fetchClubes();
      setClubes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('color_principal', colorPrincipal);
    if (logoFile) {
      formData.append('logo', logoFile);
    } else if (currentLogoPath) {
      formData.append('logo_path', currentLogoPath);
    }

    try {
      if (editingId) {
        await updateClub(editingId, formData);
      } else {
        await createClub(formData);
      }
      resetForm();
      loadClubes();
    } catch (err: any) {
      alert(err.message || 'Error al guardar club');
    }
  };

  const resetForm = () => {
    setNombre('');
    setColorPrincipal('#ff3d3d');
    setLogoFile(null);
    setCurrentLogoPath(null);
    setEditingId(null);
  };

  const handleEdit = (club: any) => {
    setEditingId(club.id);
    setNombre(club.nombre);
    setColorPrincipal(club.color_principal || '#ff3d3d');
    setCurrentLogoPath(club.logo_path || null);
    setLogoFile(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar club? Esto podría borrar también a sus jugadores y equipos.')) return;
    try {
      await deleteClub(id);
      loadClubes();
    } catch (err) {
      alert('Error al eliminar. Verifique que no tenga dependencias.');
    }
  };

  if (loading) return <div className="loading">Cargando clubes...</div>;

  return (
    <div className="admin-entity-container">
      <header className="entity-header">
        <h1>Gestión de Clubes</h1>
      </header>

      <section className="entity-form-section">
        <h3>{editingId ? 'Editar Club' : 'Nuevo Club'}</h3>
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-group">
            <label>Nombre del Club</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Escudo / Logo (Imagen)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} 
            />
            {currentLogoPath && !logoFile && <p className="file-hint">Mantiene logo actual</p>}
          </div>
          <div className="form-group">
            <label>Color Principal</label>
            <input 
              type="color" 
              value={colorPrincipal} 
              onChange={(e) => setColorPrincipal(e.target.value)} 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">{editingId ? 'ACTUALIZAR' : 'CREAR'}</button>
            {editingId && <button type="button" onClick={resetForm} className="cancel-btn">CANCELAR</button>}
          </div>
        </form>
      </section>

      <section className="entity-list-section">
        <div className="entity-grid">
          {clubes.map(c => (
            <div key={c.id} className="entity-card">
              <img src={getImageUrl(c.logo_path)} alt={c.nombre} className="entity-logo-preview" />
              <div className="entity-info">
                <h4>{c.nombre}</h4>
                <div className="color-indicator" style={{ backgroundColor: c.color_principal }}></div>
              </div>
              <div className="entity-actions">
                <button onClick={() => handleEdit(c)} className="edit-icon-btn">✎</button>
                <button onClick={() => handleDelete(c.id)} className="delete-icon-btn">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClubAdmin;
