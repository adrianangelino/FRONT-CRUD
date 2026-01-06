import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'
import { Event } from '../types'

export interface CreateEventRequest {
  name: string // Nome do evento
  startDate: string // Data/hora de início (ISO string)
  endDate: string // Data/hora de término (ISO string)
  companyId: number // ID da empresa (obrigatório)
  ticketTypeId: number // ID do tipo de ticket (obrigatório)
  deletedAt?: string // Data de exclusão (opcional)
}

export interface UpdateEventRequest {
  name?: string // Nome do evento
  startDate?: string // Data/hora de início (ISO string)
  endDate?: string // Data/hora de término (ISO string)
  companyId?: number // ID da empresa
  quantity?: number // Quantidade de ingressos
  ticketTypeId?: number // ID do tipo de ticket
}

export interface EventResponse {
  id: string | number
  name: string
  startDate: string
  endDate: string
  ticketTypeId?: number // ID do tipo de ticket do evento
  companyId?: number // ID da empresa do evento
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  // Campos opcionais que podem vir do backend
  title?: string
  description?: string
  date?: string
  time?: string
  location?: string
  price?: number
  image?: string
  totalTickets?: number
  soldTickets?: number
  status?: 'active' | 'inactive' | 'cancelled'
}

export const eventsService = {
  async createEvent(data: CreateEventRequest): Promise<EventResponse> {
    return apiClient.post<EventResponse>(API_ENDPOINTS.CREATE_EVENT, data)
  },

  async getAllEvents(): Promise<EventResponse[]> {
    try {
      const response = await apiClient.get<EventResponse[]>(API_ENDPOINTS.GET_ALL_EVENTS)
      return response
    } catch (error: any) {
      // Se o erro for "Nenhum evento válido", retornar array vazio em vez de lançar erro
      if (error?.message === 'Nenhum evento válido' || error?.errorData?.message === 'Nenhum evento válido') {
        return []
      }
      // Para outros erros, relançar
      throw error
    }
  },

  async getEventById(id: string): Promise<EventResponse> {
    return apiClient.get<EventResponse>(API_ENDPOINTS.GET_EVENT_BY_ID(id))
  },

  async updateEvent(id: string, data: UpdateEventRequest): Promise<EventResponse> {
    return apiClient.patch<EventResponse>(API_ENDPOINTS.UPDATE_EVENT(id), data)
  },

  async softDeleteEvent(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.SOFT_DELETE_EVENT(id)
    )
  },

  // Helper para converter EventResponse para Event
  mapToEvent(response: EventResponse): Event {
    // Formatar data de início
    let formattedDate = ''
    let formattedTime = ''
    
    if (response.startDate) {
      try {
        const startDate = new Date(response.startDate)
        formattedDate = startDate.toLocaleDateString('pt-BR')
        formattedTime = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } catch {
        formattedDate = response.startDate
      }
    } else if (response.date) {
      formattedDate = response.date
      formattedTime = response.time || ''
    }

    // Determinar status baseado em deletedAt
    let status: 'active' | 'inactive' | 'cancelled' = 'active'
    // Verificar se o evento foi deletado (deletedAt não é null nem undefined)
    const isDeleted = response.deletedAt !== null && response.deletedAt !== undefined
    
    if (isDeleted) {
      status = 'cancelled'
    } else if (response.status) {
      status = response.status
    } else if (response.endDate) {
      const endDate = new Date(response.endDate)
      const now = new Date()
      if (endDate < now) {
        status = 'inactive'
      }
    }

    return {
      id: String(response.id),
      title: response.name || response.title || 'Evento sem nome',
      description: response.description || '',
      date: formattedDate,
      time: formattedTime,
      location: response.location || 'Local não informado',
      price: response.price || 0,
      image: response.image,
      totalTickets: response.totalTickets || 0,
      soldTickets: response.soldTickets || 0,
      status,
    }
  },
}

