import { useState, useEffect } from 'react'
import { Ticket, Calendar, User } from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import { useEvents } from '../hooks/useEvents'
import { authService } from '../services/auth'

export default function ClienteDashboard() {
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets()
  const { events, loading: eventsLoading, fetchEvents } = useEvents()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const email = authService.getUserEmail()
    setUserEmail(email)
    
    // Buscar tickets e eventos do usuário
    fetchTickets().catch(() => {})
    fetchEvents().catch(() => {})
  }, [fetchTickets, fetchEvents])

  // Filtrar tickets do usuário logado
  const userTickets = tickets.filter(ticket => 
    ticket.buyerEmail === userEmail || ticket.buyerName.toLowerCase().includes(userEmail?.toLowerCase() || '')
  )

  // Filtrar eventos relacionados aos tickets do usuário
  const userEventIds = new Set(userTickets.map(ticket => ticket.eventId))
  const userEvents = events.filter(event => userEventIds.has(event.id))

  const loading = ticketsLoading || eventsLoading

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minha Área</h1>
          <p className="text-gray-400">Bem-vindo, {userEmail || 'Usuário'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Meus Ingressos</p>
              <p className="text-3xl font-bold text-white">{userTickets.length}</p>
            </div>
            <div className="bg-primary-500/20 p-3 rounded-lg">
              <Ticket className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Eventos</p>
              <p className="text-3xl font-bold text-white">{userEvents.length}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Perfil</p>
              <p className="text-lg font-semibold text-white">Ativo</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* My Tickets */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Meus Ingressos</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-400">Carregando...</div>
        ) : userTickets.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>Você ainda não possui ingressos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {userTickets.map((ticket) => {
                  const event = events.find(e => e.id === ticket.eventId)
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{ticket.buyerName}</div>
                        <div className="text-sm text-gray-400">{ticket.buyerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{event?.name || event?.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'valid' 
                            ? 'bg-green-500/20 text-green-400' 
                            : ticket.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ticket.status === 'valid' ? 'Válido' : ticket.status === 'pending' ? 'Pendente' : 'Inválido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {ticket.purchaseDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ticket.pdfUrl && (
                          <a
                            href={ticket.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-400 font-medium"
                          >
                            Ver PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

