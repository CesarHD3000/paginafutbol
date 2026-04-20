import React, { useEffect, useState } from 'react';
import { fetchJugadores, createJugador, updateJugador, deleteJugador, fetchClubes, getImageUrl } from '../../services/api';
import './AdminEntity.css';

const JugadorAdmin: React.FC = () => {
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRut, setEditingRut] = useState<string | null>(null);

  // Form states
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState(0);
  const [clubId, setClubId] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [currentFotoPath, setCurrentFotoPath] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [jData, cData] = await Promise.all([fetchJugadores(), fetchClubes()]);
      setJugadores(jData);
      setClubes(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId) return alert('Debes seleccionar un club');

    const formData = new FormData();
    formData.append('rut', rut);
    formData.append('nombre', nombre);
    formData.append('numero', numero.toString());
    formData.append('club_id', clubId);
    
    if (fotoFile) {
      formData.append('foto', fotoFile);
    } else if (currentFotoPath) {
      formData.append('foto_path', currentFotoPath);
    }

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

  const resetForm = () => {
    setRut('');
    setNombre('');
    setNumero(0);
    setClubId('');
    setFotoFile(null);
    setCurrentFotoPath(null);
    setEditingRut(null);
  };

  const handleEdit = (j: any) => {
    setEditingRut(j.rut);
    setRut(j.rut);
    setNombre(j.nombre);
    setNumero(j.numero);
    setClubId(j.club_id.toString());
    setCurrentFotoPath(j.foto_path || null);
    setFotoFile(null);
  };

  const handleDelete = async (rutToDelete: string) => {
    if (!confirm('¿Eliminar jugador?')) return;
    try {
      await deleteJugador(rutToDelete);
      loadData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="loading">Cargando jugadores...</div>;

  return (
    <div className="admin-entity-container">
      <header className="entity-header">
        <h1>Gestión de Jugadores</h1>
      </header>

      <section className="entity-form-section">
        <h3>{editingRut ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>RUT (Sin puntos, con guión)</label>
              <input 
                type="text" 
                value={rut} 
                onChange={(e) => setRut(e.target.value)} 
                placeholder="12345678-9"
                required 
                disabled={!!editingRut} // El RUT no se edita, es la identidad
              />
            </div>
            <div className="form-group">
              <label>Número de Camiseta</label>
              <input 
                type="number" 
                value={numero} 
                onChange={(e) => setNumero(parseInt(e.target.value))} 
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Club</label>
            <select 
              value={clubId} 
              onChange={(e) => setClubId(e.target.value)} 
              required
            >
              <option value="">Selecciona un club</option>
              {clubes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Foto del Jugador</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files ? e.target.files[0] : null)} 
            />
            {currentFotoPath && !fotoFile && <p className="file-hint">Mantiene foto actual</p>}
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">{editingRut ? 'ACTUALIZAR' : 'CREAR'}</button>
            {editingRut && <button type="button" onClick={resetForm} className="cancel-btn">CANCELAR</button>}
          </div>
        </form>
      </section>

      <section className="entity-list-section">
        <div className="entity-grid">
          {jugadores.map(j => (
            <div key={j.rut} className="entity-card">
              <div className="player-badge">#{j.numero}</div>
              <img src={getImageUrl(j.foto_path)} alt={j.nombre} className="entity-logo-preview" />
              <div className="entity-info">
                <h4>{j.nombre}</h4>
                <p className="sub-info-rut">{j.rut}</p>
                <span className="sub-info">{j.club_nombre}</span>
              </div>
              <div className="entity-actions">
                <button onClick={() => handleEdit(j)} className="edit-icon-btn">✎</button>
                <button onClick={() => handleDelete(j.rut)} className="delete-icon-btn">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JugadorAdmin;
