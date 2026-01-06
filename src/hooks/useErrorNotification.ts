import { useCallback } from 'react'
import { useNotificationContext } from '../contexts/NotificationContext'
import { getErrorMessage, getErrorType } from '../utils/errorHandler'

/**
 * Hook para exibir notificações de erro de forma padronizada
 */
export function useErrorNotification() {
  const { showNotification } = useNotificationContext()

  const showError = useCallback((error: unknown) => {
    const message = getErrorMessage(error)
    const type = getErrorType(error)
    showNotification(message, type, 6000) // 6 segundos para erros
  }, [showNotification])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification(message, 'success', duration || 4000)
  }, [showNotification])

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification(message, 'info', duration || 4000)
  }, [showNotification])

  const showWarning = useCallback((message: string, duration?: number) => {
    showNotification(message, 'warning', duration || 5000)
  }, [showNotification])

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  }
}

