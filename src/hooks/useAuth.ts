import { useState } from 'react'
import { authService, LoginRequest, LoginResponse } from '../services/auth'
import { ApiError } from '../services/api'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<LoginResponse['user'] | null>(null)

  const login = async (credentials: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      if (response.user) {
        setUser(response.user)
      }
      return response
    } catch (err: any) {
      const apiError = err as ApiError
      const errorMessage = apiError.message || 'Erro ao fazer login'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = () => {
    return authService.isAuthenticated()
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  }
}

