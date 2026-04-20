import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { verifyToken } from '../services/api';

const PrivateRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await verifyToken();
        if (res.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token'); // Limpiar token inválido
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [token]);

  // Mientras se verifica, mostrar nada (o un spinner de carga)
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
