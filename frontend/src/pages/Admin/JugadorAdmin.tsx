import React, { useEffect, useState, useRef } from 'react';
import { fetchClubes, fetchJugadores, createJugador, updateJugador, deleteJugador, getImageUrl } from '../../services/api';
import './JugadorAdmin.css';

const JugadorAdmin: React.FC = () => {
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRut, setEditingRut] = useState<string | null>(null);

  // Estados del Formulario
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [clubId, setClubId] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentFotoPath, setCurrentFotoPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const [jData, cData] = await Promise.all([fetchJugadores(), fetchClubes()]);
      setJugadores(jData);
      setClubes(cData);
      if (cData.length > 0) setClubId(cData[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Vista previa de imagen
  useEffect(() => {
    if (!logoFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const resetForm = () => {
    setRut('');
    setNombre('');
    setNumero('');
    if (clubes.length > 0) setClubId(clubes[0].id.toString());
    setLogoFile(null);
    setPreviewUrl(null);
    setCurrentFotoPath(null);
    setEditingRut(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rut', rut);
    formData.append('nombre', nombre);
    formData.append('numero', numero);
    formData.append('club_id', clubId);
    if (logoFile) formData.append('foto', logoFile);

    try {
      if (editingRut) {
        await updateJugador(editingRut, formData);
      } else {
        await createJugador(formData);
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar jugador');
    }
  };

  const handleEdit = (j: any) => {
    setEditingRut(j.rut);
    setRut(j.rut);
    setNombre(j.nombre);
    setNumero(j.numero.toString());
    setClubId(j.club_id.toString());
    setCurrentFotoPath(j.foto_path);
    setLogoFile(null);
  };

  const handleDelete = async (rut: string) => {
    if (!confirm('¿Eliminar jugador?')) return;
    try {
      await deleteJugador(rut);
      loadData();
    } catch (err) {
      alert('Error al eliminar jugador');
    }
  };

  if (loading) return <div className="loading">Cargando gestión...</div>;

  return (
    <div className="jugador-admin-container">
      <div className="jugador-admin-content">
        <header className="jugador-header">
          <h1>Gestión de Jugadores</h1>
        </header>

        <section className="jugador-card">
          <h3>{editingRut ? 'Editando Jugador' : 'Nuevo Jugador'}</h3>
          
          <form onSubmit={handleSubmit} className="jugador-form">
            {/* RUT - Columna 1 */}
            <div className="form-group">
              <label>RUT (Identificación)</label>
              <input 
                type="text" 
                value={rut} 
                onChange={(e) => setRut(e.target.value)} 
                placeholder="12.345.678-9" 
                className="modern-input"
                disabled={!!editingRut}
                required 
              />
            </div>

            {/* Número - Columna 2 */}
            <div className="form-group">
              <label>N° Camiseta</label>
              <input 
                type="number" 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)} 
                placeholder="10" 
                className="modern-input"
                required 
              />
            </div>

            {/* Nombre - Fila Completa */}
            <div className="form-group full-width">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Nombre del deportista" 
                className="modern-input"
                required 
              />
            </div>

            {/* Club - Fila Completa */}
            <div className="form-group full-width">
              <label>Club de Pertenencia</label>
              <select 
                value={clubId} 
                onChange={(e) => setClubId(e.target.value)}
                className="modern-select"
              >
                {clubes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Foto - Fila Completa */}
            <div className="form-group full-width">
              <label>Fotografía de Jugador</label>
              <div className="file-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} 
                />
                <div className="file-info">
                  <i>📷</i>
                  <span>{logoFile ? logoFile.name : 'Haz clic para seleccionar o arrastra una imagen'}</span>
                </div>
              </div>
              
              {/* Previews */}
              {previewUrl && <img src={previewUrl} className="preview-box" alt="Nueva" />}
              {currentFotoPath && !logoFile && (
                <div style={{marginTop: '10px'}}>
                  <p style={{fontSize: '0.7rem', color: '#64748b'}}>Foto Actual:</p>
                  <img src={getImageUrl(currentFotoPath)} className="preview-box" alt="Actual" />
                </div>
              )}
            </div>

            <button type="submit" className="btn-submit">
              {editingRut ? 'Guardar Cambios' : 'Crear Jugador'}
            </button>
          </form>

          {editingRut && (
            <button className="btn-cancel" onClick={resetForm}>Cancelar Edición</button>
          )}
        </section>

        {/* Listado Simplificado (Opcional según tu diseño, pero útil para editar) */}
        <section style={{marginTop: '50px'}} className="jugador-card">
          <h3 style={{marginBottom: '20px'}}>Jugadores Registrados</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {jugadores.map(j => (
              <div key={j.rut} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                <div>
                  <span style={{fontWeight: '700'}}>{j.numero}</span> - {j.nombre} ({j.club_nombre})
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button onClick={() => handleEdit(j)} style={{background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer'}}>EDITAR</button>
                  <button onClick={() => handleDelete(j.rut)} style={{background: 'none', border: 'none', color: '#ff3d3d', cursor: 'pointer'}}>ELIMINAR</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JugadorAdmin;
