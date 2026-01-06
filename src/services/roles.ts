import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'

export interface Role {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface RoleResponse {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export const rolesService = {
  async getAllRoles(): Promise<RoleResponse[]> {
    return apiClient.get<RoleResponse[]>(API_ENDPOINTS.GET_ALL_ROLES)
  },
}

