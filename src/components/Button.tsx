import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  icon?: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  icon, 
  onClick,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
  
  const variantClasses = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500",
    outline: "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

