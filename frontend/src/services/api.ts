// Usar variables de entorno si existen, de lo contrario usar localhost (Online ready)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:3000';

// --- UTILIDADES ---
export const getImageUrl = (path: string | null) => {
  if (!path) return 'https://via.placeholder.com/150?text=SIN+IMAGEN';
  
  // Si ya tiene una URL completa (http://...), la devolvemos tal cual
  if (path.startsWith('http')) return path;

  // Limpiamos el path para asegurar que no haya dobles barras
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${BASE_URL}/${cleanPath}`;
};

// --- CATEGORÍAS ---
export const fetchCategorias = async () => {
  const response = await fetch(`${API_URL}/categorias`);
  if (!response.ok) throw new Error('Error al obtener categorías');
  return response.json();
};

export const createCategoria = async (categoria: any) => {
  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(categoria)
  });
  if (!response.ok) throw new Error('Error al crear categoría');
  return response.json();
};

export const updateCategoria = async (id: number, categoria: any) => {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(categoria)
  });
  if (!response.ok) throw new Error('Error al actualizar categoría');
  return response.json();
};

export const deleteCategoria = async (id: number) => {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar categoría');
  return response.json();
};

// --- CLUBES (Instituciones) ---
export const fetchClubes = async () => {
  const response = await fetch(`${API_URL}/equipos/clubes`);
  if (!response.ok) throw new Error('Error al obtener clubes');
  return response.json();
};

export const createClub = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/equipos/clubes`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear club');
  }
  return response.json();
};

export const updateClub = async (id: number, formData: FormData) => {
  const response = await fetch(`${API_URL}/equipos/clubes/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar club');
  }
  return response.json();
};

export const deleteClub = async (id: number) => {
  const response = await fetch(`${API_URL}/equipos/clubes/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar club');
  return response.json();
};

// --- EQUIPOS (Inscripciones en categorías) ---
export const fetchEquiposPorCategoria = async (categoriaId: number) => {
  const response = await fetch(`${API_URL}/equipos/categoria/${categoriaId}`);
  if (!response.ok) throw new Error('Error al obtener equipos de la categoría');
  return response.json();
};

export const createEquipo = async (equipo: any) => {
  const response = await fetch(`${API_URL}/equipos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(equipo)
  });
  if (!response.ok) throw new Error('Error al inscribir club en categoría');
  return response.json();
};

export const updateEquipo = async (id: number, equipo: any) => {
  const response = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(equipo)
  });
  if (!response.ok) throw new Error('Error al actualizar equipo');
  return response.json();
};

export const deleteEquipo = async (id: number) => {
  const response = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar inscripción/equipo');
  return response.json();
};

export const fetchTabla = async (categoriaId: number) => {
  const response = await fetch(`${API_URL}/equipos/tabla/${categoriaId}`);
  if (!response.ok) throw new Error('Error al obtener la tabla de posiciones');
  return response.json();
};

// --- PARTIDOS ---
export const fetchRecientes = async (categoriaId?: number) => {
  const url = categoriaId ? `${API_URL}/partidos/recientes?categoria_id=${categoriaId}` : `${API_URL}/partidos/recientes`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener partidos recientes');
  return response.json();
};

export const fetchProximos = async (categoriaId?: number) => {
  const url = categoriaId ? `${API_URL}/partidos/proximos?categoria_id=${categoriaId}` : `${API_URL}/partidos/proximos`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener próximos partidos');
  return response.json();
};

export const fetchPartidoDetalle = async (id: string) => {
  const response = await fetch(`${API_URL}/partidos/${id}`);
  if (!response.ok) throw new Error('Error al obtener el detalle del partido');
  return response.json();
};

export const createPartido = async (partido: any) => {
  const response = await fetch(`${API_URL}/partidos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(partido)
  });
  if (!response.ok) throw new Error('Error al crear partido');
  return response.json();
};

export const updatePartido = async (id: string, partido: any) => {
  const response = await fetch(`${API_URL}/partidos/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(partido)
  });
  if (!response.ok) throw new Error('Error al actualizar partido');
  return response.json();
};

export const deletePartido = async (id: string) => {
  const response = await fetch(`${API_URL}/partidos/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar partido');
  return response.json();
};

export const updatePartidoEstado = async (id: string, data: { estado: string, goles_local: number, goles_visitante: number }) => {
  const response = await fetch(`${API_URL}/partidos/${id}/estado`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar el estado');
  return response.json();
};

export const updatePartidoMinuto = async (id: string, minuto: number) => {
  const response = await fetch(`${API_URL}/partidos/${id}/minuto`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ minuto_actual: minuto })
  });
  if (!response.ok) throw new Error('Error al actualizar el minuto');
  return response.json();
};

export const addEvento = async (evento: any) => {
  const response = await fetch(`${API_URL}/eventos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(evento)
  });
  if (!response.ok) throw new Error('Error al registrar el evento');
  return response.json();
};

export const deleteEvento = async (id: number) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar el evento');
  return response.json();
};

// --- JUGADORES ---
export const fetchJugadores = async (clubId?: string) => {
  const url = clubId ? `${API_URL}/jugadores?club_id=${clubId}` : `${API_URL}/jugadores`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener jugadores');
  return response.json();
};

export const createJugador = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/jugadores`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear jugador');
  }
  return response.json();
};

export const updateJugador = async (rut: string, formData: FormData) => {
  const response = await fetch(`${API_URL}/jugadores/${rut}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar jugador');
  }
  return response.json();
};

export const deleteJugador = async (rut: string) => {
  const response = await fetch(`${API_URL}/jugadores/${rut}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar jugador');
  return response.json();
};

// --- PÚBLICO / UTILIDADES ---
export const fetchEquipoPublico = async (id: string) => {
  const response = await fetch(`${API_URL}/equipos/clubes/${id}/public`);
  if (!response.ok) throw new Error('Error al obtener información del club');
  return response.json();
};

// --- AUTENTICACIÓN ---
export const login = async (credentials: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en el login');
  }
  return response.json();
};

// --- VERIFICACIÓN DE SESIÓN ---
export const verifyToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false };

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return { valid: false };
    return await response.json();
  } catch (error) {
    return { valid: false };
  }
};
