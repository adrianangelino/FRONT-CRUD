import { useState, useCallback } from 'react'
import Notification, { NotificationData } from './Notification'

let notificationIdCounter = 0

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = useCallback((
    message: string,
    type: 'error' | 'success' | 'info' | 'warning' = 'error',
    duration?: number
  ) => {
    const id = `notification-${++notificationIdCounter}`
    const notification: NotificationData = {
      id,
      message,
      type,
      duration,
    }

    setNotifications(prev => [...prev, notification])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notifications,
    showNotification,
    removeNotification,
  }
}

interface NotificationContainerProps {
  notifications: NotificationData[]
  onClose: (id: string) => void
}

export default function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

