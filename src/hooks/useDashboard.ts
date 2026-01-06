import { useState, useEffect } from 'react'
import { useEvents } from './useEvents'
import { useTickets } from './useTickets'
import { useUsers } from './useUsers'
import { authService } from '../services/auth'
import { ticketsService, EventTicketSummary } from '../services/tickets'

export function useDashboard() {
  const { events, fetchEvents } = useEvents()
  const { tickets, fetchTickets } = useTickets()
  const { users, fetchUsers } = useUsers()
  const [loading, setLoading] = useState(true)
  const [eventTicketSummaries, setEventTicketSummaries] = useState<EventTicketSummary[]>([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Obter email do usuário logado
        const userEmail = authService.getUserEmail()
        
        // Carrega os dados em paralelo
        await Promise.all([
          fetchEvents().catch(() => {}),
          fetchTickets().catch(() => {}),
          // Buscar resumo de tickets por evento para gráfico e receita
          ticketsService.getEventTicketSummaries()
            .then(data => setEventTicketSummaries(data))
            .catch(() => {
              // Se falhar, não quebrar o dashboard
              setEventTicketSummaries([])
            }),
          // Buscar usuário pelo email se disponível e válido
          userEmail && userEmail.trim() !== ''
            ? fetchUsers({ email: userEmail.trim() }).catch(() => {
                // Se der erro, não quebrar o dashboard
                return []
              })
            : Promise.resolve(),
        ])
      } catch (error) {
        // Erro silencioso
      } finally {
        setLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Enriquecer os summaries com dados dos tickets reais
  const enrichedSummaries = eventTicketSummaries.map(summary => {
    const eventTickets = tickets.filter(t => String(t.eventId) === String(summary.eventId))
    
    // Calcular soldTickets: usar o calculado do backend (totalTickets - remaining) ou contar os tickets reais
    const backendSoldTickets = summary.soldTickets || (summary.totalTickets > 0 && summary.remaining !== undefined ? summary.totalTickets - summary.remaining : 0)
    const soldTickets = backendSoldTickets > 0 ? backendSoldTickets : eventTickets.length
    
    // Calcular receita: usar totalPrice do backend ou calcular a partir dos tickets reais
    const backendRevenue = summary.totalPrice || summary.revenue || 0
    const calculatedRevenue = backendRevenue > 0 ? backendRevenue : eventTickets.reduce((sum, t) => sum + (t.price || 0), 0)
    
    // Se totalTickets for 0 mas houver tickets, usar a quantidade de tickets
    const totalTickets = summary.totalTickets > 0 ? summary.totalTickets : (eventTickets.length > 0 ? eventTickets.length : 1)
    
    return {
      ...summary,
      soldTickets: soldTickets,
      revenue: calculatedRevenue,
      totalTickets: totalTickets,
    }
  })

  // Calcular receita total estimada a partir dos summaries enriquecidos
  const estimatedRevenue = enrichedSummaries.reduce((sum, summary) => {
    return sum + (summary.revenue || 0)
  }, 0)

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'active').length,
    soldTickets: tickets.length,
    registeredUsers: users.length,
    estimatedRevenue: estimatedRevenue,
  }

  return {
    stats,
    events,
    tickets,
    users,
    eventTicketSummaries: enrichedSummaries, // Dados para o gráfico (enriquecidos)
    loading,
  }
}

