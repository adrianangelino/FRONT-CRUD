import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  iconColor?: string
}

export default function StatCard({ title, value, icon, iconColor = 'text-primary-500' }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className={`${iconColor} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

