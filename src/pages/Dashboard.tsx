import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  TrendingUp, 
  Ticket, 
  Users, 
  DollarSign
} from 'lucide-react'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { useDashboard } from '../hooks/useDashboard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { stats, events, tickets, eventTicketSummaries, loading } = useDashboard()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral do sistema de eventos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Eventos"
          value={stats.totalEvents}
          icon={<Calendar className="w-8 h-8" />}
          iconColor="text-primary-500"
        />
        <StatCard
          title="Eventos Ativos"
          value={stats.activeEvents}
          icon={<TrendingUp className="w-8 h-8" />}
          iconColor="text-green-500"
        />
        <StatCard
          title="Ingressos Vendidos"
          value={stats.soldTickets}
          icon={<Ticket className="w-8 h-8" />}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Usuários Cadastrados"
          value={stats.registeredUsers}
          icon={<Users className="w-8 h-8" />}
          iconColor="text-orange-500"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Receita Total Estimada</p>
            <p className="text-blue-400 text-3xl font-bold">
              {loading ? 'Carregando...' : `R$ ${stats.estimatedRevenue.toFixed(2)}`}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-purple-500 opacity-80" />
        </div>
        
        {/* Gráfico de Receita por Evento */}
        {eventTicketSummaries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-4">Receita por Evento</h3>
            <div className="space-y-3">
              {eventTicketSummaries.map((summary) => {
                const revenue = summary.revenue || 0
                const soldTickets = summary.soldTickets || 0
                const totalTickets = summary.totalTickets || 1
                
                // Calcular porcentagem baseada em tickets vendidos vs total
                const ticketPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0
                
                return (
                  <div key={summary.eventId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate flex-1 mr-2">{summary.eventName || 'Evento sem nome'}</span>
                      <span className="text-primary-400 font-semibold">
                        R$ {revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-primary-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.max(ticketPercentage, 0)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{soldTickets} vendidos</span>
                      <span>{totalTickets} total</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Ingressos Recentes</h2>
            <a href="/admin/ingressos" className="text-primary-500 hover:text-primary-400 text-sm font-medium">
              Ver todos →
            </a>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p>Carregando...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Ticket className="w-16 h-16 mb-4 opacity-30" />
              <p>Nenhum ingresso vendido ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{ticket.code}</p>
                    <p className="text-gray-400 text-xs">{ticket.eventTitle}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    ticket.status === 'valid' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.status === 'valid' ? 'Válido' : 'Usado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Próximos Eventos</h2>
            <a href="/admin/eventos" className="text-primary-500 hover:text-primary-400 text-sm font-medium">
              Ver todos →
            </a>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p>Carregando...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="w-16 h-16 mb-4 opacity-30" />
              <p>Nenhum evento próximo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.filter(e => e.status === 'active').slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{event.title}</p>
                    <p className="text-gray-400 text-xs">{event.date} - {event.time}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            icon={<Calendar className="w-4 h-4" />}
            className="w-full justify-center"
            onClick={() => navigate('/admin/eventos')}
          >
            Gerenciar Eventos
          </Button>
          <Button
            variant="secondary"
            icon={<Ticket className="w-4 h-4" />}
            className="w-full justify-center"
            onClick={() => navigate('/admin/ingressos')}
          >
            Ver Ingressos
          </Button>
          <Button
            variant="secondary"
            icon={<Users className="w-4 h-4" />}
            className="w-full justify-center"
            onClick={() => navigate('/admin/usuarios')}
          >
            Gerenciar Usuários
          </Button>
        </div>
      </div>
    </div>
  )
}

