import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Users, 
  LogOut,
  ChevronRight,
  Tag,
  Building2,
  QrCode
} from 'lucide-react'
import { useState } from 'react'
import { authService } from '../services/auth'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { path: '/admin/ingressos', label: 'Ingressos', icon: Ticket },
  { path: '/admin/tipos-ticket', label: 'Tipos de Ticket', icon: Tag },
  { path: '/admin/usuarios', label: 'Usuários', icon: Users },
  { path: '/admin/empresa', label: 'Minha Empresa', icon: Building2 },
  { path: '/admin/verificar-ingresso', label: 'Verificar Ingresso', icon: QrCode },
]

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    setIsMobileOpen(false)
    navigate('/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md text-gray-300 hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-800 border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">EventosPro</h1>
                <p className="text-gray-400 text-xs">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </NavLink>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

