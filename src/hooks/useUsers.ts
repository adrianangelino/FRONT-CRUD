import { useState, useCallback } from 'react'
import { usersService } from '../services/users'
import { User } from '../types'
import { useErrorNotification } from './useErrorNotification'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { showError } = useErrorNotification()

  const fetchUsers = async (params?: Parameters<typeof usersService.getUser>[0]) => {
    setLoading(true)
    try {
      const response = await usersService.getUser(params)
      const usersArray = Array.isArray(response) ? response : [response]
      const mappedUsers = usersArray.map(usersService.mapToUser)
      setUsers(mappedUsers)
      return mappedUsers
    } catch (err) {
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data: Parameters<typeof usersService.createUser>[0]) => {
    setLoading(true)
    try {
      const response = await usersService.createUser(data)
      const newUser = usersService.mapToUser(response)
      setUsers(prev => [...prev, newUser])
      return response
    } catch (err) {
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await usersService.getAllUsers()
      const usersArray = Array.isArray(response) ? response : [response]
      const mappedUsers = usersArray.map(usersService.mapToUser)
      setUsers(mappedUsers)
      return mappedUsers
    } catch (err) {
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [showError])

  const deleteUser = async (id: string) => {
    setLoading(true)
    try {
      await usersService.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err) {
      showError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    fetchAllUsers,
    createUser,
    deleteUser,
  }
}

