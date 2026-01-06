import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'
import { Ticket } from '../types'

export interface CreateTicketRequest {
  email: string // Email do comprador
  name: string // Nome do comprador (usado no PDF)
  eventId: number // ID do evento (obrigatório)
  userId: number // ID do usuário (obrigatório, obtido ao buscar pelo email)
  companyId: number // ID da empresa (obrigatório, obtido do usuário logado)
  ticketTypeId: number // ID do tipo de ticket (obrigatório, obtido do evento)
}

export interface CheckTicketRequest {
  code: string
}

export interface GetTicketByUserNameRequest {
  name: string // Nome do usuário para buscar tickets
}

export interface TicketResponse {
  id: string | number
  name: string // Nome do comprador
  hash: string // Código/hash do ticket
  pdfUrl?: string
  status?: string // Status do ticket (pending, valid, used, cancelled, etc)
  deletedAt?: string | null
  eventId: string | number
  userId: string | number
  price?: number // Preço do ticket
  ticketTypeId?: number // ID do tipo de ticket
  createdAt?: string
  updatedAt?: string
  // Campos opcionais que podem vir de joins ou transformações
  eventTitle?: string
  buyerName?: string
  buyerEmail?: string
  purchaseDate?: string
  code?: string // Alias para hash
}

export interface EventTicketSummary {
  eventId: number
  eventName: string
  totalTickets: number
  remaining: number
  totalPrice: number
  // Campos calculados/enriquecidos
  soldTickets?: number
  revenue?: number
}

export const ticketsService = {
  async createTicket(data: CreateTicketRequest): Promise<TicketResponse> {
    // Normalizar email para minúsculas
    const normalizedEmail = String(data.email || '').trim().toLowerCase()
    
    // Garantir que todos os campos numéricos sejam números válidos
    const eventId = Number(data.eventId)
    const userId = Number(data.userId)
    const companyId = Number(data.companyId)
    const ticketTypeId = Number(data.ticketTypeId)
    
    // Validações
    if (!normalizedEmail || normalizedEmail.length === 0) {
      throw new Error('Email é obrigatório para criar o ticket')
    }
    
    const name = String(data.name || '').trim()
    if (!name || name.length === 0) {
      throw new Error('Nome é obrigatório para criar o ticket')
    }
    
    if (isNaN(eventId) || eventId <= 0) {
      throw new Error('EventId deve ser um número válido')
    }
    
    if (isNaN(userId) || userId <= 0) {
      throw new Error('UserId deve ser um número válido')
    }
    
    if (isNaN(companyId) || companyId <= 0) {
      throw new Error('CompanyId deve ser um número válido')
    }
    
    if (isNaN(ticketTypeId) || ticketTypeId <= 0) {
      throw new Error('TicketTypeId deve ser um número válido')
    }
    
    // Montar payload exatamente como no Insomnia
    const ticketData = {
      email: normalizedEmail,
      name: name,
      eventId: eventId,
      userId: userId,
      companyId: companyId,
      ticketTypeId: ticketTypeId,
    }
    
    return apiClient.post<TicketResponse>(API_ENDPOINTS.CREATE_TICKET, ticketData)
  },

  async checkTicket(data: CheckTicketRequest): Promise<TicketResponse> {
    return apiClient.post<TicketResponse>(API_ENDPOINTS.CHECK_TICKET, data)
  },

  async getAllTickets(): Promise<TicketResponse[]> {
    return apiClient.get<TicketResponse[]>(API_ENDPOINTS.GET_ALL_TICKETS)
  },

  async getTicketByUserName(params: GetTicketByUserNameRequest): Promise<TicketResponse> {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append('name', params.name)
    
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.GET_TICKET_BY_USER_NAME}?${queryParams.toString()}`
      : API_ENDPOINTS.GET_TICKET_BY_USER_NAME
    
    return apiClient.get<TicketResponse>(endpoint)
  },

  async getTicketById(id: string): Promise<TicketResponse> {
    return apiClient.get<TicketResponse>(API_ENDPOINTS.GET_TICKET_BY_ID(id))
  },

  async softDeleteTicket(id: string): Promise<TicketResponse> {
    return apiClient.delete<TicketResponse>(
      API_ENDPOINTS.SOFT_DELETE_TICKET(id)
    )
  },

  async getEventTicketSummaries(): Promise<EventTicketSummary[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.GET_EVENT_TICKET_SUMMARIES)
    
    // Mapear os dados do backend para o formato esperado
    return response.map((item: any) => {
      const totalTickets = item.totalTickets || 0
      const remaining = item.remaining || 0
      const soldTickets = totalTickets > 0 ? totalTickets - remaining : 0
      
      return {
        eventId: item.eventId || item.event_id || item.id || 0,
        eventName: item.eventName || item.event_name || item.name || 'Evento sem nome',
        totalTickets: totalTickets,
        remaining: remaining,
        totalPrice: item.totalPrice || item.total_price || 0,
        soldTickets: soldTickets,
        revenue: item.totalPrice || item.total_price || 0,
      }
    })
  },

  // Helper para converter TicketResponse para Ticket
  mapToTicket(response: TicketResponse): Ticket {
    // Mapear status do backend para o formato esperado
    let ticketStatus: 'valid' | 'used' | 'cancelled' = 'valid'
    if (response.status) {
      const statusLower = response.status.toLowerCase()
      if (statusLower === 'used') {
        ticketStatus = 'used'
      } else if (statusLower === 'cancelled' || statusLower === 'deleted' || response.deletedAt) {
        ticketStatus = 'cancelled'
      } else {
        ticketStatus = 'valid'
      }
    }
    
    // Usar hash como code se code não estiver disponível
    const code = response.code || response.hash || ''
    
    // Formatar data de compra se disponível
    let purchaseDate = response.purchaseDate || ''
    if (!purchaseDate && response.createdAt) {
      try {
        purchaseDate = new Date(response.createdAt).toLocaleDateString('pt-BR')
      } catch {
        purchaseDate = response.createdAt
      }
    }
    
    return {
      id: String(response.id || ''),
      code: code,
      eventId: String(response.eventId || ''),
      eventTitle: response.eventTitle || 'Evento não informado',
      buyerName: response.buyerName || response.name || '',
      buyerEmail: response.buyerEmail || '',
      purchaseDate: purchaseDate,
      status: ticketStatus,
      price: response.price,
    }
  },
}

