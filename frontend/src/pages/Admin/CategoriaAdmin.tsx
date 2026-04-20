import React, { useEffect, useState } from 'react';
import { fetchCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/api';
import './AdminEntity.css';

const CategoriaAdmin: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', orden: 0 });

  const loadCategorias = async () => {
    try {
      const data = await fetchCategorias();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategoria(editingId, formData);
      } else {
        await createCategoria(formData);
      }
      setFormData({ nombre: '', descripcion: '', orden: 0 });
      setEditingId(null);
      loadCategorias();
    } catch (err) {
      alert('Error al guardar categoría');
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '', orden: cat.orden || 0 });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar categoría? Asegúrese de que no tenga equipos inscritos.')) return;
    try {
      await deleteCategoria(id);
      loadCategorias();
    } catch (err) {
      alert('Error al eliminar. Verifique dependencias.');
    }
  };

  if (loading) return <div className="loading">Cargando categorías...</div>;

  return (
    <div className="admin-entity-container">
      <header className="entity-header">
        <h1>Gestión de Categorías</h1>
      </header>

      <section className="entity-form-section">
        <h3>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
        <form onSubmit={handleSubmit} className="entity-form">
          <div className="form-group">
            <label>Nombre de la Categoría</label>
            <input 
              type="text" 
              value={formData.nombre} 
              onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              placeholder="Ej: Primera División"
              required 
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input 
              type="text" 
              value={formData.descripcion} 
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
              placeholder="Ej: Torneo oficial de adultos"
            />
          </div>
          <div className="form-group">
            <label>Orden de Visualización</label>
            <input 
              type="number" 
              value={formData.orden} 
              onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})} 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">{editingId ? 'ACTUALIZAR' : 'CREAR'}</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({nombre:'', descripcion:'', orden:0})}} className="cancel-btn">CANCELAR</button>}
          </div>
        </form>
      </section>

      <section className="entity-list-section">
        <div className="entity-grid">
          {categorias.map(c => (
            <div key={c.id} className="entity-card">
              <div className="entity-info">
                <h4>{c.nombre}</h4>
                <p>{c.descripcion}</p>
                <span className="sub-info">Orden: {c.orden}</span>
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

export default CategoriaAdmin;
