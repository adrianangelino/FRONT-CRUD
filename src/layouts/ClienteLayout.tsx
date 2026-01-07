import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { LogOut, Sparkles, Home, Calendar } from 'lucide-react'
import { authService } from '../services/auth'

export default function ClienteLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-purple-500">EventosPro</h1>
                  <p className="text-xs text-gray-300">TICKETS & EVENTS</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/cliente/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/cliente/eventos"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <Calendar className="w-4 h-4" />
                  <span>Eventos</span>
                </NavLink>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

