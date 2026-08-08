import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { verifyToken } from '../services/api';
import AdminSidebar from './AdminSidebar/AdminSidebar';

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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [token]);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout" style={{ display: 'flex' }}>
      <AdminSidebar />
      <main className="admin-main-content" style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '2rem', 
        minHeight: '100vh',
        background: '#0f172a'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateRoute;
