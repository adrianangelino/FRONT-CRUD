import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

export interface NotificationData {
  id: string
  message: string
  type: 'error' | 'success' | 'info' | 'warning'
  duration?: number
}

interface NotificationProps {
  notification: NotificationData
  onClose: (id: string) => void
}

export default function Notification({ notification, onClose }: NotificationProps) {
  useEffect(() => {
    const duration = notification.duration || 5000
    const timer = setTimeout(() => {
      onClose(notification.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-500/20 border-red-500/50'
      case 'success':
        return 'bg-green-500/20 border-green-500/50'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'error':
        return 'text-red-300'
      case 'success':
        return 'text-green-300'
      case 'warning':
        return 'text-yellow-300'
      case 'info':
        return 'text-blue-300'
      default:
        return 'text-gray-300'
    }
  }

  return (
    <div
      className={`${getBgColor()} border rounded-lg p-4 shadow-lg backdrop-blur-sm min-w-[300px] max-w-[400px] animate-slideInRight`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

