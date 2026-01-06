import { useState, useCallback } from 'react'
import { eventsService } from '../services/events'
import { Event } from '../types'
import { ApiError } from '../services/api'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await eventsService.getAllEvents()
      const eventsArray = Array.isArray(response) ? response : [response]
      const mappedEvents = eventsArray.map(eventsService.mapToEvent)
      setEvents(mappedEvents)
      return mappedEvents
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message || 'Erro ao carregar eventos'
      setError(errorMessage)
      // Não relançar o erro para evitar "Uncaught (in promise)"
      // Apenas definir o estado de erro
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = async (data: Parameters<typeof eventsService.createEvent>[0]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await eventsService.createEvent(data)
      const newEvent = eventsService.mapToEvent(response)
      setEvents(prev => [...prev, newEvent])
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao criar evento')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await eventsService.softDeleteEvent(id)
      setEvents(prev => prev.filter(event => event.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao deletar evento')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getEventById = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await eventsService.getEventById(id)
      return eventsService.mapToEvent(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao buscar evento')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (id: string, data: Parameters<typeof eventsService.updateEvent>[1]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await eventsService.updateEvent(id, data)
      const updatedEvent = eventsService.mapToEvent(response)
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event))
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao atualizar evento')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  }
}

