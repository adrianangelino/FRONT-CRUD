import { useState, useEffect, useRef } from 'react'
import { QrCode, CheckCircle2, XCircle, Loader2, Camera } from 'lucide-react'
import { ticketsService } from '../services/tickets'
import { TicketResponse } from '../services/tickets'
import Button from '../components/Button'
import ErrorBoundary from '../components/ErrorBoundary'

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
      confettiElements.forEach(confetti => confetti.remove())
    }
  }, [])

  return null
}

// Declaração de tipos para html5-qrcode (será instalado depois)
declare global {
  interface Window {
    Html5Qrcode: any
  }
}

export default function CheckTicket() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<TicketResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [manualHash, setManualHash] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const scannerIdRef = useRef<string>(`qr-reader-${Date.now()}`)
  const isolatedScannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Carregar a biblioteca html5-qrcode dinamicamente
    const loadQrCodeLibrary = async () => {
      try {
        // Tentar carregar do CDN se não estiver instalado
        if (!window.Html5Qrcode) {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
          script.async = true
          document.head.appendChild(script)
          
          await new Promise((resolve) => {
            script.onload = resolve
            script.onerror = () => {
              resolve(null)
            }
            setTimeout(() => resolve(null), 10000) // Timeout de 10s
          })
        }
      } catch (err) {
        // Ignorar erros silenciosamente
      }
    }

    loadQrCodeLibrary()
  }, [])

  const startScanning = async () => {
    if (!window.Html5Qrcode) {
      setError('Biblioteca de QR code não carregada. Por favor, recarregue a página.')
      return
    }

    try {
      setScanning(true)
      setResult(null)
      setError(null)
      setSuccess(false)

      // Aguardar o React atualizar o DOM com o novo container
      // Tentar várias vezes para garantir que o ref está disponível
      let container = scannerContainerRef.current
      let attempts = 0
      while (!container && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        container = scannerContainerRef.current
        attempts++
      }

      // Buscar o container no DOM após o React renderizar
      if (!container) {
        setScanning(false)
        setError('Container do scanner não encontrado. Tente novamente.')
        return
      }

      // Configurar o ID do container para o scanner
      container.id = scannerIdRef.current
      isolatedScannerRef.current = container

      // Aguardar mais um pouco para garantir que o DOM está estável
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const html5QrCode = new window.Html5Qrcode(scannerIdRef.current)
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          handleScannedCode(decodedText)
        },
        (_errorMessage: string) => {
          // Ignorar erros de leitura
        }
      )
    } catch (err: any) {
      setScanning(false)
      cleanupScanner()
      if (err?.message?.includes('Permission denied') || err?.message?.includes('NotAllowedError')) {
        setError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.')
      } else if (err?.message?.includes('NotFoundError')) {
        setError('Nenhuma câmera encontrada. Por favor, conecte uma câmera e tente novamente.')
      } else {
        setError('Erro ao iniciar o scanner: ' + (err?.message || 'Erro desconhecido'))
      }
    }
  }

  const cleanupScanner = () => {
    // Parar o scanner primeiro
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().catch(() => {})
        html5QrCodeRef.current.clear().catch(() => {})
      } catch (err) {
        // Ignorar erros
      }
      html5QrCodeRef.current = null
    }

    // Limpar o container de forma segura
    if (scannerContainerRef.current) {
      try {
        // Limpar o conteúdo do scanner
        scannerContainerRef.current.innerHTML = ''
        // Remover o ID para evitar conflitos
        scannerContainerRef.current.removeAttribute('id')
      } catch (err) {
        // Ignorar erros
      }
    }
    
    isolatedScannerRef.current = null
  }

  const stopScanning = async () => {
    cleanupScanner()
    setScanning(false)
  }

  const handleScannedCode = async (hash: string) => {
    try {
      // Parar o scanner
      await stopScanning()
      
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Verificar o ticket
      const ticketData = await ticketsService.checkTicket({ hash: hash })
      
      setResult(ticketData)
      setSuccess(true)
      setLoading(false)
      setIsClosing(false)

      // Resetar após 5 segundos com animação de saída
      setTimeout(() => {
        setIsClosing(true)
        setTimeout(() => {
          setSuccess(false)
          setResult(null)
          setIsClosing(false)
        }, 400) // Tempo da animação de saída
      }, 5000)
    } catch (err: any) {
      setLoading(false)
      setSuccess(false)
      
      if (err?.message?.includes('Ticket não encontrado') || err?.status === 400) {
        setError('Ticket não encontrado')
      } else {
        setError(err?.message || 'Erro ao verificar ticket')
      }

      // Resetar erro após 3 segundos com animação de saída
      setTimeout(() => {
        setIsClosing(true)
        setTimeout(() => {
          setError(null)
          setIsClosing(false)
        }, 400) // Tempo da animação de saída
      }, 3000)
    }
  }

  const handleManualInput = async (hash: string) => {
    if (!hash.trim()) {
      setError('Por favor, insira um código de ticket')
      return
    }

    await handleScannedCode(hash.trim())
  }

  useEffect(() => {
    // Limpar ao desmontar
    return () => {
      cleanupScanner()
    }
  }, [])

  return (
    <ErrorBoundary>
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Verificar Ingresso</h1>
          <p className="text-gray-400">Escaneie o QR code do ingresso para verificar</p>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex flex-col items-center gap-6">
          {/* Scanner Area */}
          <div className="w-full max-w-md">
            {!scanning ? (
              <div className="w-full rounded-lg overflow-hidden min-h-[200px] bg-gray-700 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-8 text-center w-full">
                  <Camera className="w-16 h-16 text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-2">Clique em "Iniciar Scanner" para começar</p>
                  <p className="text-gray-500 text-sm">Ou insira o código manualmente abaixo</p>
                </div>
              </div>
            ) : (
              <div
                ref={scannerContainerRef}
                className="w-full rounded-lg overflow-hidden min-h-[400px] bg-gray-900"
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            {!scanning ? (
              <Button
                variant="primary"
                icon={<QrCode className="w-4 h-4" />}
                onClick={startScanning}
                disabled={loading}
                className="w-full"
              >
                Iniciar Scanner
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={<XCircle className="w-4 h-4" />}
                onClick={stopScanning}
                disabled={loading}
                className="w-full"
              >
                Parar Scanner
              </Button>
            )}

            {/* Manual Input */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ou insira o código manualmente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  placeholder="Cole ou digite o hash do ticket"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualInput(manualHash)
                    }
                  }}
                />
                <Button
                  variant="primary"
                  onClick={() => handleManualInput(manualHash)}
                  disabled={loading}
                >
                  Verificar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-gray-400">Verificando ticket...</p>
        </div>
      )}

      {/* Success Animation - Full Screen Overlay com Confetes */}
      {success && result && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          {/* Confetes */}
          <Confetti />
          
          {/* Modal de Sucesso */}
          <div className={`relative bg-green-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${isClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'}`}>
            {/* Círculo branco com checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>
            
            {/* Título */}
            <div className="text-center mb-6 animate-slideUp delay-100">
              <h2 className="text-3xl font-bold text-white mb-2">Check-in realizado!</h2>
              <p className="text-xl text-white/90">Bem-vindo ao evento 🎉</p>
            </div>

            {/* Informações do ticket */}
            <div className="space-y-3 animate-slideUp delay-200">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Nome do Comprador</p>
                <p className="text-white font-semibold text-lg">{result.name}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Código do Ticket</p>
                <p className="text-white font-mono text-sm break-all">{result.hash}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 text-white">
                  {result.status === 'valid' ? 'Válido' : result.status === 'used' ? 'Usado' : 'Cancelado'}
                </span>
              </div>
              {result.createdAt && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white/70 text-sm mb-1">Data de Compra</p>
                  <p className="text-white">
                    {new Date(result.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Animation - Full Screen Overlay */}
      {error && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          {/* Modal de Erro */}
          <div className={`relative bg-red-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${isClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'}`}>
            {/* Círculo branco com X */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            
            {/* Mensagem de erro */}
            <div className="text-center animate-slideUp delay-100">
              <h2 className="text-3xl font-bold text-white mb-2">
                {error.includes('Ticket não encontrado') ? 'QR Code inválido' : 'Erro na Verificação'}
              </h2>
              <p className="text-xl text-white/90">
                {error.includes('Ticket não encontrado') ? 'Verifique e tente novamente' : error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  )
}

