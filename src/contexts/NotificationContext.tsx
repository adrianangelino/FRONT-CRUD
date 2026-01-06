import { createContext, useContext, ReactNode } from 'react'
import { useNotification, NotificationData } from '../components/NotificationContainer'

interface NotificationContextType {
  notifications: NotificationData[]
  showNotification: (
    message: string,
    type?: 'error' | 'success' | 'info' | 'warning',
    duration?: number
  ) => string
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, showNotification, removeNotification } = useNotification()

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}

