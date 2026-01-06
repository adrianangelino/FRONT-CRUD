import { useState, useCallback } from 'react'
import { usersService, UserResponse } from '../services/users'
import { User } from '../types'
import { ApiError } from '../services/api'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (params?: Parameters<typeof usersService.getUser>[0]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersService.getUser(params)
      const usersArray = Array.isArray(response) ? response : [response]
      const mappedUsers = usersArray.map(usersService.mapToUser)
      setUsers(mappedUsers)
      return mappedUsers
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao carregar usuários')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data: Parameters<typeof usersService.createUser>[0]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersService.createUser(data)
      const newUser = usersService.mapToUser(response)
      setUsers(prev => [...prev, newUser])
      return response
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao criar usuário')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersService.getAllUsers()
      const usersArray = Array.isArray(response) ? response : [response]
      const mappedUsers = usersArray.map(usersService.mapToUser)
      setUsers(mappedUsers)
      return mappedUsers
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao carregar usuários')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await usersService.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Erro ao deletar usuário')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchAllUsers,
    createUser,
    deleteUser,
  }
}

