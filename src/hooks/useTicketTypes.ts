import { useState, useCallback } from 'react'
import { ticketTypesService, TicketTypeResponse, CreateTicketTypeRequest, GetTicketTypeByNameRequest } from '../services/ticketTypes'
import { ApiError } from '../services/api'

export function useTicketTypes() {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTicketTypes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketTypesService.getAllTicketTypes()
      const ticketTypesArray = Array.isArray(response) ? response : [response]
      setTicketTypes(ticketTypesArray)
      return ticketTypesArray
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao carregar tipos de ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createTicketType = async (data: CreateTicketTypeRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketTypesService.createTicketType(data)
      setTicketTypes(prev => [...prev, response])
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao criar tipo de ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTicketTypeByName = async (params: GetTicketTypeByNameRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketTypesService.getTicketTypeByName(params)
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao buscar tipo de ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTicketType = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await ticketTypesService.softDeleteTicketType(id)
      setTicketTypes(prev => prev.filter(ticketType => String(ticketType.id) !== id))
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao deletar tipo de ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    ticketTypes,
    loading,
    error,
    fetchTicketTypes,
    createTicketType,
    getTicketTypeByName,
    deleteTicketType,
  }
}

