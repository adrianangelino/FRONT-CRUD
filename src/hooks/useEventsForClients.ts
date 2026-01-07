import { useState, useCallback } from 'react'
import { eventsService, EventResponse } from '../services/events'
import { Event } from '../types'
import { ApiError } from '../services/api'
import { useErrorNotification } from './useErrorNotification'

export function useEventsForClients() {
  const [events, setEvents] = useState<Event[]>([])
  const [eventsRaw, setEventsRaw] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useErrorNotification()

  const fetchEventsForClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await eventsService.getAllEventsForClients()
      const eventsArray = Array.isArray(response) ? response : [response]
      const mappedEvents = eventsArray.map(eventsService.mapToEvent)
      setEvents(mappedEvents)
      setEventsRaw(eventsArray)
      return mappedEvents
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message || 'Erro ao carregar eventos'
      setError(errorMessage)
      showError(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [showError])

  return {
    events,
    eventsRaw,
    loading,
    error,
    fetchEventsForClients,
  }
}

