import { apiClient } from './api'
import { API_ENDPOINTS } from '../config/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token?: string
  role?: {
    id: number
    name: string
  }
  user?: {
    id: string
    aud: string
    role: string
    email: string
    email_confirmed_at?: string
    phone?: string
    confirmed_at?: string
    last_sign_in_at?: string
    roleId?: number // ID do role do usuário
    app_metadata?: {
      provider: string
      providers: string[]
    }
    user_metadata?: {
      email_verified?: boolean
    }
    identities?: Array<{
      identity_id: string
      id: string
      user_id: string
      identity_data: {
        email: string
        email_verified: boolean
        phone_verified: boolean
        sub: string
      }
      provider: string
      last_sign_in_at: string
      created_at: string
      updated_at: string
      email: string
    }>
    created_at?: string
    updated_at?: string
    is_anonymous?: boolean
  }
  message?: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      )
      
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token)
      }
      
      // Salvar email do usuário para uso posterior
      // Prioriza o email do response.user, mas usa o email das credenciais como fallback
      const userEmail = response.user?.email || credentials.email
      if (userEmail) {
        localStorage.setItem('user_email', userEmail)
      }
      
      // Salvar role ID para redirecionamento
      // Prioriza roleId do user, depois role.id do response
      const roleId = response.user?.roleId || response.role?.id
      if (roleId) {
        localStorage.setItem('user_role_id', String(roleId))
      }
      
      return response
    } catch (error: any) {
      throw error
    }
  },

  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role_id')
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  getUserEmail(): string | null {
    return localStorage.getItem('user_email')
  },

  getUserRoleId(): number | null {
    const roleId = localStorage.getItem('user_role_id')
    return roleId ? parseInt(roleId, 10) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

