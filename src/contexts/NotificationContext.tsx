import { createContext, useContext, ReactNode } from 'react'
import { useNotification } from '../components/NotificationContainer'
import NotificationContainer from '../components/NotificationContainer'

interface NotificationContextType {
  showNotification: (
    message: string,
    type?: 'error' | 'success' | 'info' | 'warning',
    duration?: number
  ) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, showNotification, removeNotification } = useNotification()

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
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

