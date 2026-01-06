import { useState, useCallback } from 'react'
import { ticketsService } from '../services/tickets'
import { Ticket } from '../types'
import { ApiError } from '../services/api'

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.getAllTickets()
      const ticketsArray = Array.isArray(response) ? response : [response]
      
      // Buscar eventos para obter os títulos
      const { eventsService } = await import('../services/events')
      let eventsMap: Record<string, string> = {}
      
      try {
        const events = await eventsService.getAllEvents()
        const eventsArray = Array.isArray(events) ? events : [events]
        eventsArray.forEach(event => {
          eventsMap[String(event.id)] = event.name || event.title || 'Evento sem nome'
        })
      } catch (err) {
        // Erro silencioso ao buscar eventos
      }
      
      // Mapear tickets e adicionar eventTitle
      const mappedTickets = ticketsArray.map(ticket => {
        const mapped = ticketsService.mapToTicket(ticket)
        // Adicionar eventTitle se disponível no mapa de eventos
        if (eventsMap[mapped.eventId]) {
          mapped.eventTitle = eventsMap[mapped.eventId]
        }
        return mapped
      })
      
      setTickets(mappedTickets)
      return mappedTickets
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message || 'Erro ao carregar ingressos'
      setError(errorMessage)
      // Não relançar o erro para evitar "Uncaught (in promise)"
      // Apenas definir o estado de erro
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createTicket = async (data: Parameters<typeof ticketsService.createTicket>[0]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.createTicket(data)
      const newTicket = ticketsService.mapToTicket(response)
      setTickets(prev => [...prev, newTicket])
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao criar ingresso')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkTicket = async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.checkTicket({ code })
      return ticketsService.mapToTicket(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao verificar ingresso')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTicket = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await ticketsService.softDeleteTicket(id)
      setTickets(prev => prev.filter(ticket => ticket.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao deletar ingresso')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTicketById = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.getTicketById(id)
      return ticketsService.mapToTicket(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao buscar ingresso')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTicketByUserName = async (name: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.getTicketByUserName({ name })
      return ticketsService.mapToTicket(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao buscar ingresso por nome do usuário')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    checkTicket,
    deleteTicket,
    getTicketById,
    getTicketByUserName,
  }
}

