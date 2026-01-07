import { useState, useEffect, useRef } from 'react'
import { QrCode, X, CheckCircle2 } from 'lucide-react'
import { ticketsService } from '../services/tickets'
import { useErrorNotification } from '../hooks/useErrorNotification'

interface TicketQRCodeProps {
  ticketHash: string
  ticketId: string
  userId: string | number
  isOpen: boolean
  onClose: () => void
  onValidated: () => void
}

// Componente de Confetes
function Confetti() {
  useEffect(() => {
    const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899']
    const confettiCount = 50
    const confettiElements: HTMLElement[] = []

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 10 + 5
      const startX = Math.random() * window.innerWidth
      const startY = -10
      const endY = window.innerHeight + 10
      const duration = Math.random() * 3 + 2
      const delay = Math.random() * 0.5

      confetti.style.position = 'fixed'
      confetti.style.width = `${size}px`
      confetti.style.height = `${size}px`
      confetti.style.backgroundColor = color
      confetti.style.left = `${startX}px`
      confetti.style.top = `${startY}px`
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'
      confetti.style.pointerEvents = 'none'
      confetti.style.zIndex = '60'
      confetti.style.opacity = '0'

      document.body.appendChild(confetti)
      confettiElements.push(confetti)

      // Animação
      setTimeout(() => {
        confetti.style.transition = `all ${duration}s ease-out`
        confetti.style.opacity = '1'
        confetti.style.transform = `translateY(${endY}px) rotate(${Math.random() * 360}deg)`
        confetti.style.left = `${startX + (Math.random() - 0.5) * 200}px`
      }, delay * 1000)

      // Remover após animação
      setTimeout(() => {
        confetti.remove()
      }, (delay + duration) * 1000)
    }

    return () => {
      confettiElements.forEach(confetti => {
        if (confetti.parentNode) {
          confetti.remove()
        }
      })
    }
  }, [])

  return null
}

export default function TicketQRCode({ ticketHash, ticketId, userId, isOpen, onClose, onValidated }: TicketQRCodeProps) {
  const [validated, setValidated] = useState(false)
  const initialStatusRef = useRef<string | null>(null)
  const hasValidatedRef = useRef(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // QR Code URL usando API pública
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketHash)}`


  // Resetar estado e INICIAR verificação IMEDIATAMENTE quando o modal abrir
  useEffect(() => {
    if (!isOpen || !userId) {
      // Limpar ao fechar
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    // Resetar estado
    setValidated(false)
    initialStatusRef.current = null
    hasValidatedRef.current = false
    
    // Limpar intervalo anterior se existir
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Função para verificar status - DEFINIDA DENTRO DO useEffect
    const executeCheck = async () => {
      // Verificar condições antes de executar
      if (!isOpen || !userId) {
        return
      }
      
      if (validated || hasValidatedRef.current) {
        return
      }
      
      try {
        // CHAMAR A API AGORA (sem cache para garantir dados atualizados)
        const tickets = await ticketsService.getTicketsByUserId(userId, false)
        
        const currentTicket = tickets.find(t => String(t.id) === String(ticketId))
        
        if (!currentTicket) {
          return
        }
        
        const currentStatus = String(currentTicket.status || '').toLowerCase()
        
        if (initialStatusRef.current === null) {
          initialStatusRef.current = currentStatus
          return
        }
        
        const statusChanged = initialStatusRef.current !== currentStatus
        const wasPending = initialStatusRef.current === 'pending'
        const isNowValid = currentStatus === 'valid'
        const isNowUsed = currentStatus === 'used'
        
        const isValidated = statusChanged && (
          (wasPending && (isNowValid || isNowUsed)) || 
          isNowUsed
        )
        
        if (isValidated && !hasValidatedRef.current) {
          hasValidatedRef.current = true
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          
          setValidated(true)
          
          setTimeout(() => {
            onValidated()
            setTimeout(() => {
              onClose()
              setValidated(false)
              initialStatusRef.current = null
              hasValidatedRef.current = false
            }, 3000)
          }, 500)
        }
      } catch (err) {
        // Erro silencioso - não interrompe o polling
      }
    }
    
    // CHAMAR IMEDIATAMENTE (sem delay)
    executeCheck()

    // Configurar polling a cada 1 segundo
    pollingIntervalRef.current = setInterval(() => {
      executeCheck()
    }, 1000)

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isOpen, userId, ticketId]) // Executar quando modal abrir ou ticket mudar (removido validated para evitar loops)

  if (!isOpen) {
    return null
  }

  return (
    <>
      {validated && <Confetti />}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className={`bg-gray-800 rounded-lg border-2 border-purple-500 max-w-md w-full p-6 relative transform transition-all duration-300 ${validated ? 'scale-105 border-green-500' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-white">QR Code do Ingresso</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className={`bg-white p-4 rounded-lg mb-4 transition-all duration-300 ${validated ? 'ring-4 ring-green-500 ring-opacity-50' : ''}`}>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
            
            {validated ? (
              <div className="flex flex-col items-center gap-2 animate-slideUpFromBottom">
                <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
                <p className="text-green-400 font-semibold text-lg">Ticket Validado!</p>
                <p className="text-gray-400 text-sm">Seu ingresso foi escaneado com sucesso</p>
              </div>
            ) : (
              <>
                <p className="text-gray-300 text-sm mb-2 text-center">
                  Apresente este QR code para validação no evento
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Aguardando validação...</span>
                </div>
              </>
            )}
          </div>

          {/* Hash do ticket */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">Hash: {ticketHash}</p>
          </div>
        </div>
      </div>
    </>
  )
}

