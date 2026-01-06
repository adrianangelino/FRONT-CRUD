import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'
import { User } from '../types'

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  companyId?: number // ID da empresa (opcional - pode vir do backend)
  roleId: number // ID do papel/role (obrigatório)
  novoEmail?: string // Email alternativo (opcional)
}

export interface UserResponse {
  id: string | number
  name: string
  email: string
  companyId?: number // ID da empresa do usuário
  roleId?: number // ID do papel/role do usuário
  registrationDate?: string
  createdAt?: string
  role?: 'admin' | 'user'
}

export interface GetUserParams {
  id?: string
  email?: string
}

export const usersService = {
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>(API_ENDPOINTS.CREATE_USER, data)
  },

  async getUser(params?: GetUserParams): Promise<UserResponse | UserResponse[]> {
    const queryParams = new URLSearchParams()
    if (params?.id) queryParams.append('id', params.id)
    if (params?.email) queryParams.append('email', params.email)
    
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.GET_USER}?${queryParams.toString()}`
      : API_ENDPOINTS.GET_USER
    
    return apiClient.get<UserResponse | UserResponse[]>(endpoint)
  },

  async getAllUsers(): Promise<UserResponse[]> {
    return apiClient.get<UserResponse[]>(API_ENDPOINTS.GET_ALL_USERS)
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.DELETE_USER(id))
  },

  // Helper para converter UserResponse para User
  mapToUser(response: UserResponse): User {
    // Formatar data de criação
    let registrationDate = response.registrationDate || response.createdAt
    if (registrationDate) {
      try {
        const date = new Date(registrationDate)
        registrationDate = date.toLocaleDateString('pt-BR')
      } catch {
        // Se não conseguir parsear, usar como está
      }
    } else {
      registrationDate = new Date().toLocaleDateString('pt-BR')
    }

    return {
      id: String(response.id), // Converter para string
      name: response.name,
      email: response.email,
      registrationDate,
      role: response.role || 'user',
    }
  },
}

