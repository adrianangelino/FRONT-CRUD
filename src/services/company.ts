import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'

export interface TicketTypeInfo {
  ticketTypeId: number
  ticketTypeName: string
  price: number
  limit: number
  sold: number
  total: number
}

export interface EventInfo {
  eventId: number
  eventName: string
  ticketTypes: TicketTypeInfo[]
}

export interface CompanySummary {
  id: number
  name: string
  totalEvents: number
  totalTickets: number
  events: EventInfo[]
}

export const companyService = {
  async getMyCompany(): Promise<CompanySummary> {
    return apiClient.get<CompanySummary>(API_ENDPOINTS.GET_MY_COMPANY)
  },
}

