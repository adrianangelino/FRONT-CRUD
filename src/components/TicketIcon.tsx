import React from 'react'

interface TicketIconProps {
  className?: string
  size?: number
}

export default function TicketIcon({ className = '', size = 24 }: TicketIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corpo principal do ticket */}
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Recortes laterais (formato de ticket) */}
      <path
        d="M4 10C4 9.44772 4.44772 9 5 9C5.55228 9 6 9.44772 6 10C6 10.5523 5.55228 11 5 11C4.44772 11 4 10.5523 4 10Z"
        fill="currentColor"
      />
      <path
        d="M18 10C18 9.44772 18.4477 9 19 9C19.5523 9 20 9.44772 20 10C20 10.5523 19.5523 11 19 11C18.4477 11 18 10.5523 18 10Z"
        fill="currentColor"
      />
      {/* Linha tracejada no meio (simulando corte) */}
      <line
        x1="4"
        y1="10"
        x2="20"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.4"
      />
      {/* Linhas decorativas internas */}
      <line
        x1="6"
        y1="7"
        x2="18"
        y2="7"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="6"
        y1="13"
        x2="18"
        y2="13"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Círculos decorativos nos cantos */}
      <circle cx="6" cy="6" r="0.5" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="6" r="0.5" fill="currentColor" opacity="0.5" />
      <circle cx="6" cy="18" r="0.5" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="18" r="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

