import { API_BASE_URL } from '../config/api'

export interface ApiError {
  message: string
  status?: number
  errorData?: {
    message?: string
    error?: string
    statusCode?: number
    [key: string]: any
  }
  url?: string
  method?: string
}

class ApiClient {
  private baseURL: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 segundos

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getCacheKey(endpoint: string, method: string = 'GET'): string {
    return `${method}:${endpoint}`
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }
    if (cached) {
      this.cache.delete(key)
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clearCache(): void {
    this.cache.clear()
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

  async get<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, 'GET')
    
    if (useCache) {
      const cached = this.getCached<T>(cacheKey)
      if (cached !== null) {
        return cached
      }
    }
    
    const data = await this.request<T>(endpoint, { method: 'GET' })
    
    if (useCache) {
      this.setCache(cacheKey, data)
    }
    
    return data
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // Limpar cache após operações de escrita
    this.clearCache()
    return result
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    this.clearCache()
    return result
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    this.clearCache()
    return result
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await this.request<T>(endpoint, { method: 'DELETE' })
    this.clearCache()
    return result
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

