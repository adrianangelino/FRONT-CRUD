import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import Ingressos from './pages/Ingressos'
import Usuarios from './pages/Usuarios'
import TiposTicket from './pages/TiposTicket'
import CompanyProfile from './pages/CompanyProfile'
import CheckTicket from './pages/CheckTicket'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="ingressos" element={<Ingressos />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="tipos-ticket" element={<TiposTicket />} />
            <Route path="empresa" element={<CompanyProfile />} />
            <Route path="verificar-ingresso" element={<CheckTicket />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

export default App

