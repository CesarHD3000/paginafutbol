import React, { useEffect, useState, useRef } from 'react';
import { fetchClubes, createClub, updateClub, deleteClub, getImageUrl } from '../../services/api';
import './ClubAdmin.css';

const ClubAdmin: React.FC = () => {
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [colorPrincipal, setColorPrincipal] = useState('#ff3d3d');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Vista previa automática del logo seleccionado
  useEffect(() => {
    if (!logoFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

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
    setPreviewUrl(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (club: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(club.id);
    setNombre(club.nombre);
    setColorPrincipal(club.color_principal || '#ff3d3d');
    setCurrentLogoPath(club.logo_path || null);
    setLogoFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar club? Se borrarán sus inscripciones y jugadores.')) return;
    try {
      await deleteClub(id);
      loadClubes();
    } catch (err) {
      alert('Error al eliminar. Verifique dependencias.');
    }
  };

  if (loading) return <div className="loading">Cargando panel...</div>;

  return (
    <div className="club-admin-container">
      <div className="club-admin-content">
        <header className="club-admin-header">
          <h1>Gestión de Clubes</h1>
        </header>

        {/* FORMULARIO */}
        <section className="form-card">
          <h3>{editingId ? 'Editar Club Existente' : 'Registrar Nuevo Club'}</h3>
          <form onSubmit={handleSubmit} className="club-form">
            
            <div className="form-group">
              <label>Nombre de la Institución</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: Deportivo Putaendo"
                className="modern-input"
                required 
              />
            </div>

            <div className="form-group">
              <label>Color Representativo</label>
              <div className="color-picker-wrapper">
                <input 
                  type="color" 
                  value={colorPrincipal} 
                  onChange={(e) => setColorPrincipal(e.target.value)} 
                  className="modern-color-input"
                />
                <span style={{fontSize: '0.9rem', color: '#94a3b8'}}>{colorPrincipal}</span>
              </div>
            </div>

            <div className="form-group" style={{gridColumn: 'span 2'}}>
              <label>Escudo / Logo Oficial</label>
              <div className="file-upload-custom">
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} 
                />
                <div className="upload-placeholder">
                  <span>{logoFile ? `✅ ${logoFile.name}` : '📁 Haz clic o arrastra el escudo aquí'}</span>
                </div>
              </div>

              {/* Vista Previa */}
              {(previewUrl || (currentLogoPath && !logoFile)) && (
                <div style={{marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <div className="logo-container" style={{width: '60px', height: '60px'}}>
                    <img 
                      src={previewUrl || getImageUrl(currentLogoPath)} 
                      alt="Preview" 
                      className="club-logo-img" 
                    />
                  </div>
                  <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                    {previewUrl ? 'Nueva imagen seleccionada' : 'Logo actual en el servidor'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-create">
                {editingId ? 'Guardar Cambios' : 'Crear Club'}
              </button>
              <button type="button" onClick={resetForm} className="btn-clear">
                {editingId ? 'Cancelar' : 'Limpiar'}
              </button>
            </div>
          </form>
        </section>

        {/* GRID DE CLUBES */}
        <section className="club-list-section">
          <h3 style={{color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '25px', letterSpacing: '0.1em'}}>
            Instituciones Registradas
          </h3>
          <div className="club-grid">
            {clubes.map(c => (
              <div key={c.id} className="club-card-item">
                <div className="logo-container">
                  <img src={getImageUrl(c.logo_path)} alt={c.nombre} className="club-logo-img" />
                </div>
                
                <div className="club-details">
                  <h4>{c.nombre}</h4>
                  <div className="club-color-bar" style={{ backgroundColor: c.color_principal }}></div>
                </div>

                <div className="club-actions">
                  <button onClick={() => handleEdit(c)} className="action-btn edit-btn" title="Editar">
                    ✎
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="action-btn delete-btn" title="Eliminar">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClubAdmin;
