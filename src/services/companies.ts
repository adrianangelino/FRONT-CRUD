import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'

export interface Company {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface CompanyResponse {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export const companiesService = {
  async getAllCompanies(): Promise<CompanyResponse[]> {
    return apiClient.get<CompanyResponse[]>(API_ENDPOINTS.GET_ALL_COMPANIES)
  },
}

