import React, { useEffect, useState } from 'react';
import './Home.css';
import { fetchRecientes, fetchProximos, fetchTabla, fetchCategorias, getImageUrl } from '../../services/api';
import MatchCard from '../../components/MatchCard/MatchCard';
import StatsCarousel from '../../components/StatsCarousel/StatsCarousel';
import UpcomingCard from '../../components/UpcomingCard/UpcomingCard';

interface Partido {
  id: number;
  local: string;
  visitante: string;
  local_logo: string;
  visitante_logo: string;
  goles_local: number;
  goles_visitante: number;
  fecha: string;
  estado: 'pendiente' | 'en_vivo' | 'finalizado';
  categoria_nombre?: string;
}

interface EquipoTabla {
  equipo_id: number;
  nombre: string;
  logo_path: string;
  pts: number;
  pj: number;
}

const Home: React.FC = () => {
  const [partidosRecientes, setPartidosRecientes] = useState<Partido[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setError(null);
        // 1. Cargar categorías primero para obtener un ID válido
        const categorias = await fetchCategorias();
        
        if (categorias && categorias.length > 0) {
          const defaultCatId = categorias[0].id;
          
          // 2. Cargar el resto de datos usando la categoría por defecto
          const [recientes, proximos, tablaData] = await Promise.all([
            fetchRecientes(defaultCatId),
            fetchProximos(defaultCatId),
            fetchTabla(defaultCatId)
          ]);

          setPartidosRecientes(recientes);
          setProximosPartidos(proximos);
          setTabla(tablaData);
        } else {
          // Si no hay categorías, cargar lo que se pueda (general)
          const [recientes, proximos] = await Promise.all([
            fetchRecientes(),
            fetchProximos()
          ]);
          setPartidosRecientes(recientes);
          setProximosPartidos(proximos);
          setTabla([]);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No pudimos conectar con el servidor. Revisa tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando la liga...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Ocurrió un error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-hero">
        <div className="hero-content">
          <span className="hero-tag">Temporada 2026</span>
          <h1>EL CORAZÓN DEL FÚTBOL LOCAL</h1>
          <p>Resultados, estadísticas y toda la emoción de la liga en un solo lugar.</p>
        </div>
      </header>

      <main className="home-sections">
        {/* Sección de Clasificación - Pasa los datos mapeados si es necesario */}
        <StatsCarousel equipos={tabla.map(t => ({
          id: t.equipo_id,
          nombre: t.nombre,
          logo_url: getImageUrl(t.logo_path),
          puntos: t.pts,
          partidos_jugados: t.pj
        }))} />

        <section className="upcoming-section">
          <div className="section-header">
            <h2>Próximos Partidos</h2>
            <button className="view-all">Ver todos</button>
          </div>
          <div className="matches-carousel">
            {proximosPartidos.length > 0 ? (
              proximosPartidos.map((partido) => (
                <UpcomingCard key={partido.id} partido={partido} />
              ))
            ) : (
              <p className="empty-msg">No hay partidos programados.</p>
            )}
          </div>
        </section>

        <section className="results-section">
          <div className="section-header">
            <h2>Resultados Recientes</h2>
            <button className="view-all">Ver todos</button>
          </div>
          <div className="matches-carousel">
            {partidosRecientes.length > 0 ? (
              partidosRecientes.map((partido) => (
                <MatchCard key={partido.id} partido={partido} />
              ))
            ) : (
              <p className="empty-msg">No hay resultados recientes.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
