import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navbar from './components/Navbar/Navbar';
import StatsPage from './pages/Stats/StatsPage';
import TeamPage from './pages/Club/TeamPage';
import MatchesPage from './pages/Matches/MatchesPage';
import Login from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MatchAdmin from './pages/Admin/MatchAdmin';
import ClubAdmin from './pages/Admin/EquipoAdmin'; 
import CategoriaAdmin from './pages/Admin/CategoriaAdmin';
import InscripcionAdmin from './pages/Admin/InscripcionAdmin';
import JugadorAdmin from './pages/Admin/JugadorAdmin';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/partidos" element={<MatchesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/club/:id" element={<TeamPage />} />
            <Route path="/clubes" element={<div className="placeholder-page">Próximamente: Clubes</div>} />
            <Route path="/live" element={<div className="placeholder-page">Próximamente: Partidos En Vivo</div>} />
            
            {/* Rutas de Administración */}
            <Route path="/admin/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/partidos" element={<MatchAdmin />} />
              <Route path="/admin/clubes" element={<ClubAdmin />} />
              <Route path="/admin/categorias" element={<CategoriaAdmin />} />
              <Route path="/admin/inscripciones" element={<InscripcionAdmin />} />
              <Route path="/admin/jugadores" element={<JugadorAdmin />} />
            </Route>

            {/* Redirección por defecto para /admin */}
            <Route path="/admin/*" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
