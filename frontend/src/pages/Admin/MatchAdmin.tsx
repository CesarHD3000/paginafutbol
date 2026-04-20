import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPartidoDetalle, addEvento, deleteEvento, updatePartidoEstado, updatePartidoMinuto } from '../../services/api';
import './MatchAdmin.css';

const MatchAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('gol');
  const [minutoEvento, setMinutoEvento] = useState<number>(0);

  const loadData = async () => {
    if (!id) return;
    try {
      const res = await fetchPartidoDetalle(id);
      setData(res);
      setMinutoEvento(res.partido.minuto_actual || 0);
    } catch (err) {
      setError('No se pudo cargar el partido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddEvento = async () => {
    if (!selectedPlayer) return alert('Selecciona un jugador');
    try {
      await addEvento({
        partido_id: id,
        jugador_id: parseInt(selectedPlayer),
        tipo: selectedTipo,
        minuto: minutoEvento
      });
      loadData(); // Recargar para ver el marcador actualizado y el nuevo evento
    } catch (err) {
      alert('Error al agregar evento');
    }
  };

  const handleDeleteEvento = async (eventoId: number) => {
    if (!confirm('¿Eliminar este evento? El marcador se ajustará si es un gol.')) return;
    try {
      await deleteEvento(eventoId);
      loadData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    try {
      await updatePartidoEstado(id!, nuevoEstado);
      loadData();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const handleUpdateMinuto = async () => {
    try {
      await updatePartidoMinuto(id!, minutoEvento);
      loadData();
    } catch (err) {
      alert('Error al actualizar minuto');
    }
  };

  if (loading) return <div className="admin-loading">Cargando gestión de partido...</div>;
  if (!data) return <div className="admin-error">{error}</div>;

  const { partido, jugadores, eventos } = data;

  return (
    <div className="match-admin-container">
      <div className="admin-match-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Volver al Panel</button>
        <div className="status-badge">{partido.estado.toUpperCase()}</div>
      </div>

      <div className="admin-score-board">
        <div className="score-team">
          <img src={partido.local_logo} alt={partido.local} />
          <h2>{partido.local}</h2>
          <span className="big-score">{partido.goles_local}</span>
        </div>
        <div className="score-center">
          <span className="match-min">{partido.minuto_actual}'</span>
          <div className="state-controls">
            {partido.estado === 'pendiente' && <button onClick={() => handleUpdateEstado('en_vivo')} className="live-btn">INICIAR PARTIDO</button>}
            {partido.estado === 'en_vivo' && <button onClick={() => handleUpdateEstado('finalizado')} className="end-btn">FINALIZAR PARTIDO</button>}
            {partido.estado === 'finalizado' && <button onClick={() => handleUpdateEstado('en_vivo')} className="reopen-btn">REABRIR PARTIDO</button>}
          </div>
        </div>
        <div className="score-team">
          <img src={partido.visitante_logo} alt={partido.visitante} />
          <h2>{partido.visitante}</h2>
          <span className="big-score">{partido.goles_visitante}</span>
        </div>
      </div>

      <div className="admin-controls-grid">
        <section className="control-card add-event">
          <h3>Registrar Evento</h3>
          <div className="form-row">
            <label>Jugador</label>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
              <option value="">Seleccionar Jugador</option>
              <optgroup label={partido.local}>
                {jugadores.filter((j: any) => j.equipo_id === partido.equipo_local_id).map((j: any) => (
                  <option key={j.id} value={j.id}>#{j.numero} - {j.nombre}</option>
                ))}
              </optgroup>
              <optgroup label={partido.visitante}>
                {jugadores.filter((j: any) => j.equipo_id === partido.equipo_visitante_id).map((j: any) => (
                  <option key={j.id} value={j.id}>#{j.numero} - {j.nombre}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="form-row">
            <label>Tipo</label>
            <select value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
              <option value="gol">Gol</option>
              <option value="asistencia">Asistencia</option>
              <option value="tarjeta_amarilla">Tarjeta Amarilla</option>
              <option value="tarjeta_roja">Tarjeta Roja</option>
            </select>
          </div>

          <div className="form-row">
            <label>Minuto</label>
            <div className="min-input-group">
              <input type="number" value={minutoEvento} onChange={(e) => setMinutoEvento(parseInt(e.target.value))} />
              <button onClick={handleUpdateMinuto} className="update-min-btn">Act. Min</button>
            </div>
          </div>

          <button onClick={handleAddEvento} className="submit-event-btn">REGISTRAR EVENTO</button>
        </section>

        <section className="control-card event-log">
          <h3>Cronología de Eventos</h3>
          <div className="event-list">
            {eventos.length === 0 ? <p className="empty-log">No hay eventos registrados</p> : 
              eventos.map((ev: any) => (
                <div key={ev.id} className="event-item">
                  <span className="ev-min">{ev.minuto}'</span>
                  <span className="ev-type">{ev.tipo.replace('_', ' ').toUpperCase()}</span>
                  <span className="ev-player">{ev.jugador_nombre}</span>
                  <button onClick={() => handleDeleteEvento(ev.id)} className="del-ev-btn">×</button>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
};

export default MatchAdmin;
