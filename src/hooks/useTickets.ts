import { useState, useCallback } from 'react'
import { ticketsService, TicketResponse } from '../services/tickets'
import { Ticket } from '../types'
import { ApiError } from '../services/api'
import { useErrorNotification } from './useErrorNotification'

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useErrorNotification()

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.getAllTickets()
      const ticketsArray = Array.isArray(response) ? response : [response]
      
      // Mapear tickets usando apenas os dados do response (sem buscas adicionais)
      const mappedTickets = ticketsArray.map(ticket => {
        return ticketsService.mapToTicket(ticket)
      })
      
      setTickets(mappedTickets)
      return mappedTickets
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message || 'Erro ao carregar ingressos'
      setError(errorMessage)
      showError(err)
      // Não relançar o erro para evitar "Uncaught (in promise)"
      // Apenas definir o estado de erro
      return []
    } finally {
      setLoading(false)
    }
  }, [showError])

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
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkTicket = async (hash: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.checkTicket({ hash })
      return ticketsService.mapToTicket(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao verificar ingresso')
      showError(err)
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
      showError(err)
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
      showError(err)
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
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTicketByUserNameResponse = async (name: string): Promise<TicketResponse> => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketsService.getTicketByUserName({ name })
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao buscar ingresso por nome do usuário')
      showError(err)
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
    getTicketByUserNameResponse,
  }
}

