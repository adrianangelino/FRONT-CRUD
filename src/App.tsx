import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import ClienteLayout from './layouts/ClienteLayout'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import Ingressos from './pages/Ingressos'
import Usuarios from './pages/Usuarios'
import TiposTicket from './pages/TiposTicket'
import CompanyProfile from './pages/CompanyProfile'
import CheckTicket from './pages/CheckTicket'
import ClienteDashboard from './pages/ClienteDashboard'
import EventosDisponiveis from './pages/EventosDisponiveis'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationContainer from './components/NotificationContainer'
import { authService } from './services/auth'

// Componente para redirecionamento baseado no role
function DefaultRedirect() {
  const roleId = authService.getUserRoleId()
  if (roleId === 1) {
    return <Navigate to="/admin/dashboard" replace />
  } else if (roleId === 2) {
    return <Navigate to="/cliente/dashboard" replace />
  }
  return <Navigate to="/login" replace />
}

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
              <ProtectedRoute requiredRoleId={1}>
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
          
          {/* Protected Cliente Routes */}
          <Route
            path="/cliente"
            element={
              <ProtectedRoute requiredRoleId={2}>
                <ClienteLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/cliente/dashboard" replace />} />
            <Route path="dashboard" element={<ClienteDashboard />} />
            <Route path="eventos" element={<EventosDisponiveis />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<DefaultRedirect />} />
        </Routes>
      </Router>
      <NotificationContainer />
    </NotificationProvider>
  )
}

export default App

