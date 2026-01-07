import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Ticket, ShoppingCart, User, Mail, X, CheckCircle2, XCircle, Search } from 'lucide-react'
import { useEventsForClients } from '../hooks/useEventsForClients'
import { useErrorNotification } from '../hooks/useErrorNotification'
import { ticketsService, TicketResponse } from '../services/tickets'
import { usersService } from '../services/users'
import { authService } from '../services/auth'
import { eventsService } from '../services/events'
import Button from '../components/Button'

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

export default function EventosDisponiveis() {
  const { events, eventsRaw, loading, fetchEventsForClients } = useEventsForClients()
  const { showError } = useErrorNotification()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedEventRaw, setSelectedEventRaw] = useState<any>(null)
  const [purchaseForm, setPurchaseForm] = useState({
    buyerName: '',
    buyerEmail: '',
  })
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchasedTicket, setPurchasedTicket] = useState<TicketResponse | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEventsForClients().catch(() => {})
  }, [fetchEventsForClients])

  const handlePurchaseClick = async (event: any, index: number) => {
    const userEmail = authService.getUserEmail()
    setSelectedEvent(event)
    setSelectedEventRaw(eventsRaw[index])
    
    // Buscar nome do usuário logado para preencher automaticamente
    let userName = ''
    if (userEmail) {
      try {
        const userResponse = await usersService.getUser({ email: userEmail })
        const user = Array.isArray(userResponse) ? userResponse[0] : userResponse
        if (user && user.name) {
          userName = user.name
        }
      } catch (err) {
        // Se não conseguir buscar, deixa vazio
        console.warn('Não foi possível buscar nome do usuário', err)
      }
    }
    
    setPurchaseForm({
      buyerName: userName,
      buyerEmail: userEmail || '',
    })
    setShowPurchaseModal(true)
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEvent) return

    const { buyerName, buyerEmail } = purchaseForm

    if (!buyerName.trim()) {
      showError('Por favor, informe o nome do comprador')
      return
    }

    if (!buyerEmail.trim()) {
      showError('Por favor, informe o email do comprador')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(buyerEmail)) {
      showError('Por favor, informe um email válido')
      return
    }

    setPurchasing(true)

    try {
      // Obter ticketTypeId e companyId do evento
      let ticketTypeId: number | null = null
      let companyId: number | null = null
      
      if (selectedEventRaw) {
        if (selectedEventRaw.ticketTypeId) {
          ticketTypeId = Number(selectedEventRaw.ticketTypeId)
        }
        if (selectedEventRaw.companyId) {
          companyId = Number(selectedEventRaw.companyId)
        }
      }
      
      // Se não tiver no raw, buscar do backend
      if (!ticketTypeId || !companyId) {
        try {
          const eventDetails = await eventsService.getEventById(String(selectedEvent.id))
          if (eventDetails.ticketTypeId && !ticketTypeId) {
            ticketTypeId = Number(eventDetails.ticketTypeId)
          }
          if (eventDetails.companyId && !companyId) {
            companyId = Number(eventDetails.companyId)
          }
        } catch (err) {
          // Continuar mesmo se não conseguir buscar
        }
      }

      if (!ticketTypeId || isNaN(Number(ticketTypeId))) {
        showError('Evento não possui tipo de ticket configurado')
        setPurchasing(false)
        return
      }

      // Criar o ticket usando a rota do cliente
      const ticketData = {
        email: buyerEmail.toLowerCase().trim(),
        name: buyerName.trim(),
        eventId: Number(selectedEvent.id),
        ticketTypeId: Number(ticketTypeId),
        ...(companyId && !isNaN(companyId) ? { companyId: companyId } : {}),
      }

      const ticketResponse = await ticketsService.createTicketClient(ticketData)
      
      // Sucesso! Mostrar animação
      setShowPurchaseModal(false)
      setPurchasedTicket(ticketResponse)
      setPurchaseSuccess(true)
      setPurchaseError(null)
      
      // Limpar após um pequeno delay para manter as informações no modal
      setTimeout(() => {
        setSelectedEvent(null)
        setSelectedEventRaw(null)
        setPurchaseForm({ buyerName: '', buyerEmail: '' })
      }, 100)
      
      // Recarregar eventos (opcional, mas pode ser útil)
      fetchEventsForClients().catch(() => {})
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao comprar ingresso. Tente novamente.'
      setPurchaseError(errorMessage)
      setPurchaseSuccess(false)
      showError(errorMessage)
    } finally {
      setPurchasing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const isEventActive = (event: any, rawEvent?: any) => {
    const endDateStr = rawEvent?.endDate || event.endDate
    if (!endDateStr) return true
    try {
      const endDate = new Date(endDateStr)
      return endDate > new Date()
    } catch {
      return true
    }
  }

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      event.name?.toLowerCase().includes(searchLower) ||
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slideUpFromBottom mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-green-400 mb-1">DESCUBRA</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">Eventos </span>
              <span className="text-purple-500">Disponíveis</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Encontre os melhores eventos e garanta seu ingresso</p>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Carregando eventos...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento disponível</h3>
          <p className="text-gray-400">Não há eventos ativos no momento. Volte mais tarde!</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ overflow: 'visible' }}>
          {filteredEvents.map((event) => {
            const eventIndex = events.findIndex(e => e.id === event.id)
            const rawEvent = eventIndex >= 0 ? eventsRaw[eventIndex] : null
            const active = isEventActive(event, rawEvent)
            const displayIndex = eventIndex >= 0 ? eventIndex : 0
            return (
              <div
                key={event.id}
                className="bg-gray-800 rounded-lg border border-gray-700 event-card-hover animate-slideUpFromBottom"
                style={{ 
                  animationDelay: `${(displayIndex * 0.1)}s`,
                  opacity: 0
                }}
              >
                {/* Event Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border-2 border-green-500/30 overflow-hidden">
                  <Calendar className="w-16 h-16 text-green-500 icon-hover" />
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex-1">{event.name || event.title}</h3>
                    {active && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                        Ativo
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-green-500 icon-hover" />
                      <span>{formatDate(event.date || (rawEvent?.startDate || ''))}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center text-sm text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-green-500 icon-hover" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 text-green-500 icon-hover" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.price !== undefined && event.price > 0 && (
                      <div className="flex items-center text-sm text-white font-semibold">
                        <Ticket className="w-4 h-4 mr-2 text-green-500 icon-hover" />
                        <span>R$ {event.price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {rawEvent && rawEvent.startDate && rawEvent.endDate && (
                    <div className="text-xs text-gray-500 mb-4">
                      <p>Início: {formatDateTime(rawEvent.startDate)}</p>
                      <p>Término: {formatDateTime(rawEvent.endDate)}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePurchaseClick(event, eventIndex)}
                    disabled={!active}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {active ? 'Comprar Ingresso →' : 'Evento Encerrado'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Comprar Ingresso</h2>
              <button
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedEvent(null)
                  setSelectedEventRaw(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Event Info */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedEvent.name || selectedEvent.title}</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p><Calendar className="w-4 h-4 inline mr-2" />{formatDate(selectedEvent.date || selectedEvent.startDate)}</p>
                {selectedEvent.time && (
                  <p><Clock className="w-4 h-4 inline mr-2" />{selectedEvent.time}</p>
                )}
                {selectedEvent.location && (
                  <p><MapPin className="w-4 h-4 inline mr-2" />{selectedEvent.location}</p>
                )}
              </div>
            </div>

            {/* Purchase Form */}
            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome do Comprador
                </label>
                <input
                  type="text"
                  value={purchaseForm.buyerName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, buyerName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email do Comprador
                </label>
                <input
                  type="email"
                  value={purchaseForm.buyerEmail}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, buyerEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowPurchaseModal(false)
                    setSelectedEvent(null)
                    setSelectedEventRaw(null)
                  }}
                  className="flex-1"
                  disabled={purchasing}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Confirmar Compra
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Animation - Full Screen Overlay com Confetes */}
      {purchaseSuccess && purchasedTicket && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={() => {
            setIsClosing(true)
            setTimeout(() => {
              setPurchaseSuccess(false)
              setPurchasedTicket(null)
              setIsClosing(false)
            }, 400)
          }}
        >
          {/* Confetes */}
          <Confetti />
          
          {/* Modal de Sucesso */}
          <div 
            className={`relative bg-green-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${isClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => {
                setIsClosing(true)
                setTimeout(() => {
                  setPurchaseSuccess(false)
                  setPurchasedTicket(null)
                  setIsClosing(false)
                }, 400)
              }}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Círculo branco com checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>
            
            {/* Título */}
            <div className="text-center mb-6 animate-slideUp delay-100">
              <h2 className="text-3xl font-bold text-white mb-2">Compra realizada!</h2>
              <p className="text-xl text-white/90">Ingresso adquirido com sucesso 🎉</p>
            </div>

            {/* Informações do ticket */}
            <div className="space-y-3 animate-slideUp delay-200">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Nome do Comprador</p>
                <p className="text-white font-semibold text-lg">{purchasedTicket.name || purchaseForm.buyerName}</p>
              </div>
              {purchasedTicket.hash && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white/70 text-sm mb-1">Código do Ticket</p>
                  <p className="text-white font-mono text-sm break-all">{purchasedTicket.hash}</p>
                </div>
              )}
              {purchasedTicket.eventId && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white/70 text-sm mb-1">Evento</p>
                  <p className="text-white font-semibold">
                    {events.find(e => String(e.id) === String(purchasedTicket.eventId))?.name || 
                     events.find(e => String(e.id) === String(purchasedTicket.eventId))?.title || 
                     'Evento ID: ' + purchasedTicket.eventId}
                  </p>
                </div>
              )}
              {purchasedTicket.createdAt && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white/70 text-sm mb-1">Data de Compra</p>
                  <p className="text-white">
                    {new Date(purchasedTicket.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>

            {/* Botão de Fechar no rodapé */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setIsClosing(true)
                  setTimeout(() => {
                    setPurchaseSuccess(false)
                    setPurchasedTicket(null)
                    setIsClosing(false)
                  }, 400)
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Animation - Full Screen Overlay */}
      {purchaseError && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={() => {
            setIsClosing(true)
            setTimeout(() => {
              setPurchaseError(null)
              setIsClosing(false)
            }, 400)
          }}
        >
          {/* Modal de Erro */}
          <div 
            className={`relative bg-red-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${isClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => {
                setIsClosing(true)
                setTimeout(() => {
                  setPurchaseError(null)
                  setIsClosing(false)
                }, 400)
              }}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Círculo branco com X */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            
            {/* Mensagem de erro */}
            <div className="text-center animate-slideUp delay-100">
              <h2 className="text-3xl font-bold text-white mb-2">Erro na Compra</h2>
              <p className="text-xl text-white/90 mb-4">
                {purchaseError.includes('não encontrado') 
                  ? 'Usuário não encontrado' 
                  : purchaseError.includes('tipo de ticket')
                  ? 'Evento sem tipo de ticket'
                  : purchaseError.includes('empresa')
                  ? 'Erro ao obter empresa'
                  : 'Não foi possível completar a compra'}
              </p>
              <p className="text-white/80 text-sm">
                {purchaseError}
              </p>
            </div>

            {/* Botão de Fechar no rodapé */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setIsClosing(true)
                  setTimeout(() => {
                    setPurchaseError(null)
                    setIsClosing(false)
                  }, 400)
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

