import { API_BASE_URL } from '../config/api'

export interface ApiError {
  message: string
  status?: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Se for erro 401 (não autorizado), verificar se é uma requisição de login
        // Se for login, não redirecionar automaticamente para permitir ver o erro
        const isLoginRequest = endpoint.includes('/login') || endpoint.includes('/user/login')
        
        if (response.status === 401 && !isLoginRequest) {
          // Apenas redirecionar se NÃO for uma requisição de login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          throw {
            message: 'Sessão expirada. Faça login novamente.',
            status: response.status,
          } as ApiError
        }
        
        // Tentar obter mensagem de erro do backend
        let errorMessage = `Erro ${response.status}: ${response.statusText}`
        let errorData: any = null
        try {
          const text = await response.text()
          try {
            errorData = JSON.parse(text)
            
            // Priorizar a mensagem do backend sempre que disponível
            errorMessage = errorData.message || errorData.error || errorMessage
            
            // Se for 401 no login, garantir que use a mensagem do backend
            if (response.status === 401 && isLoginRequest) {
              errorMessage = errorData.message || errorData.error || 'Credenciais inválidas. Verifique seu email e senha.'
            }
          } catch {
            // Se não for JSON, usar o texto como mensagem
            errorMessage = text || errorMessage
            errorData = { raw: text }
            
            // Se for 401 no login, usar mensagem mais específica
            if (response.status === 401 && isLoginRequest) {
              errorMessage = text || 'Credenciais inválidas. Verifique seu email e senha.'
            }
          }
        } catch (parseError) {
          // Se não conseguir parsear, usar mensagem padrão
        }
        
        const apiError = {
          message: errorMessage,
          status: response.status,
          errorData,
          url,
          method: options.method || 'GET',
        } as ApiError & { errorData?: any; url?: string; method?: string }
        
        throw apiError
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      // Se já é um ApiError, apenas relança
      if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
        throw error as ApiError
      }
      
      // Erro de rede/conexão
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'
      
      if (isNetworkError) {
        throw {
          message: `Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${this.baseURL}`,
          status: 0,
        } as ApiError
      }
      
      throw {
        message: 'Erro de conexão com o servidor',
        status: 0,
      } as ApiError
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

