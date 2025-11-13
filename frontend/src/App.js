import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import ServerWakeup from './components/ServerWakeup';
import './App.css';
import CataloguePublic from './pages/CataloguePublic';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventaire from './pages/Inventaire';
import Huiles from './pages/Huiles';
import PostItPage from './pages/PostItPage';
import AgendaPage from './pages/AgendaPage';
import Stats from './pages/Stats';
import AdminPubs from './pages/admin/AdminPubs';
import AdminNumeros from './pages/admin/AdminNumeros';
import AdminEmployes from './pages/admin/AdminEmployes';
import AdminProfil from './pages/admin/AdminProfil';
import AdminLogo from './pages/admin/AdminLogo';
import { Toaster } from './components/ui/sonner';
import io from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && serverReady) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else if (!token) {
      setLoading(false);
    }
  }, [serverReady]);

  useEffect(() => {
    if (user) {
      const ws = io(BACKEND_URL, {
        path: '/api/ws',
        transports: ['websocket', 'polling']
      });
      setSocket(ws);

      return () => {
        ws.disconnect();
      };
    }
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await axios.post(`${API}/auth/login`, { username, password });
    localStorage.setItem('token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Afficher le ServerWakeup uniquement pour les routes authentifiées
  const token = localStorage.getItem('token');
  if (token && !serverReady) {
    return <ServerWakeup onReady={() => setServerReady(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, socket }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CataloguePublic />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/inventaire" element={user ? <Inventaire /> : <Navigate to="/login" />} />
          <Route path="/huiles" element={user ? <Huiles /> : <Navigate to="/login" />} />
          <Route path="/post-it" element={user ? <PostItPage /> : <Navigate to="/login" />} />
          <Route path="/agenda" element={user ? <AgendaPage /> : <Navigate to="/login" />} />
          <Route path="/stats" element={user ? <Stats /> : <Navigate to="/login" />} />
          <Route path="/admin/pubs" element={user?.role === 'admin' ? <AdminPubs /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/numeros" element={user?.role === 'admin' ? <AdminNumeros /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/employes" element={user?.role === 'admin' ? <AdminEmployes /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/logo" element={user?.role === 'admin' ? <AdminLogo /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/profil" element={user ? <AdminProfil /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthContext.Provider>
  );
}

export default App;
