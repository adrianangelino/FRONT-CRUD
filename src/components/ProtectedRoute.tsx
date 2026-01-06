import { Navigate } from 'react-router-dom'
import { authService } from '../services/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoleId?: number // Role ID necessário para acessar (1 = admin, 2 = cliente)
}

export default function ProtectedRoute({ children, requiredRoleId }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se um role específico for exigido, verificar se o usuário tem permissão
  if (requiredRoleId !== undefined) {
    const userRoleId = authService.getUserRoleId()
    if (userRoleId !== requiredRoleId) {
      // Redirecionar baseado no role do usuário
      if (userRoleId === 1) {
        return <Navigate to="/admin/dashboard" replace />
      } else if (userRoleId === 2) {
        return <Navigate to="/cliente/dashboard" replace />
      }
      // Se não tiver role definido, redirecionar para login
      return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

