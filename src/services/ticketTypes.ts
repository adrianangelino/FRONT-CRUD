import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'

export interface TicketType {
  id: number
  name: string
  price: number
  deadline?: string // ISO date string (opcional, pode vir de endDate)
  endDate?: string // ISO date string (from backend)
  companyId?: number
  quantity?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface TicketTypeResponse {
  id: number
  name: string
  price: number
  endDate: string // Backend retorna endDate, não deadline
  companyId?: number
  quantity?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface CreateTicketTypeRequest {
  name: string
  price: number
  endDate: string // ISO date string
  companyId: number
  quantity: number
}

export interface GetTicketTypeByNameRequest {
  name: string
  deletedAt?: string // ISO date string (opcional)
}

export const ticketTypesService = {
  async createTicketType(data: CreateTicketTypeRequest): Promise<TicketTypeResponse> {
    return apiClient.post<TicketTypeResponse>(API_ENDPOINTS.CREATE_TICKET_TYPE, data)
  },

  async getAllTicketTypes(): Promise<TicketTypeResponse[]> {
    return apiClient.get<TicketTypeResponse[]>(API_ENDPOINTS.GET_ALL_TICKET_TYPES)
  },

  async getTicketTypeByName(params: GetTicketTypeByNameRequest): Promise<TicketTypeResponse> {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append('name', params.name)
    if (params.deletedAt) queryParams.append('deletedAt', params.deletedAt)
    
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.GET_TICKET_TYPE_BY_NAME}?${queryParams.toString()}`
      : API_ENDPOINTS.GET_TICKET_TYPE_BY_NAME
    
    return apiClient.get<TicketTypeResponse>(endpoint)
  },

  async softDeleteTicketType(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.SOFT_DELETE_TICKET_TYPE(id))
  },

  // Helper para converter TicketTypeResponse para TicketType
  mapToTicketType(response: TicketTypeResponse): TicketType {
    return {
      id: response.id,
      name: response.name,
      price: response.price,
      deadline: response.endDate, // endDate do backend vira deadline no frontend
      endDate: response.endDate,
      companyId: response.companyId,
      quantity: response.quantity,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      deletedAt: response.deletedAt,
    }
  },
}

