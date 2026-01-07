import { useState, useEffect, useMemo, useRef } from 'react'
import { Calendar, User, Sparkles, Ticket, QrCode } from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import { authService } from '../services/auth'
import { usersService } from '../services/users'
import { eventsService } from '../services/events'
import { useErrorNotification } from '../hooks/useErrorNotification'
import { Event } from '../types'
import TicketQRCode from '../components/TicketQRCode'

export default function ClienteDashboard() {
  const { tickets, loading: ticketsLoading, fetchTicketsByUserId } = useTickets()
  const { showError } = useErrorNotification()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | number | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; hash: string } | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const userDataLoadedRef = useRef(false)

  useEffect(() => {
    // Evitar múltiplas chamadas no F5 (React Strict Mode executa 2x em dev)
    if (userDataLoadedRef.current) return
    
    const loadUserData = async () => {
      userDataLoadedRef.current = true
      try {
        const email = authService.getUserEmail()
        setUserEmail(email)
        
        if (email) {
          // Buscar dados do usuário para obter o ID
          const userResponse = await usersService.getUser({ email })
          const user = Array.isArray(userResponse) ? userResponse[0] : userResponse
          
          if (user && user.id) {
            setUserName(user.name)
            // Salvar userId para usar no modal de QR code
            const userIdValue = typeof user.id === 'string' ? user.id : String(user.id)
            setUserId(userIdValue)
            // Buscar tickets do usuário pelo ID
            await fetchTicketsByUserId(userIdValue)
          } else {
            showError('Não foi possível obter os dados do usuário')
            userDataLoadedRef.current = false
          }
        }
      } catch (err) {
        showError('Erro ao carregar dados do usuário')
        userDataLoadedRef.current = false
      }
    }
    
    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Buscar eventos públicos quando os tickets forem carregados (apenas uma vez)
  const eventsFetchedRef = useRef(false)
  useEffect(() => {
    const fetchPublicEvents = async () => {
      if (tickets.length > 0 && events.length === 0 && !eventsLoading && !eventsFetchedRef.current) {
        eventsFetchedRef.current = true
        setEventsLoading(true)
        try {
          const response = await eventsService.getPublicEvents()
          const eventsArray = Array.isArray(response) ? response : [response]
          const mappedEvents = eventsArray.map(eventsService.mapToEvent)
          setEvents(mappedEvents)
        } catch (err) {
          console.error('Erro ao buscar eventos públicos', err)
          eventsFetchedRef.current = false // Resetar em caso de erro
        } finally {
          setEventsLoading(false)
        }
      }
    }
    
    fetchPublicEvents()
  }, [tickets.length, events.length, eventsLoading])

  // Memoizar tickets do usuário
  const userTickets = useMemo(() => tickets, [tickets])

  // Criar um Map de eventos para lookup O(1) em vez de O(n)
  const eventsMap = useMemo(() => {
    const map = new Map<string, typeof events[0]>()
    events.forEach(event => {
      map.set(event.id, event)
    })
    return map
  }, [events])

  // Memoizar eventos relacionados aos tickets do usuário
  const userEvents = useMemo(() => {
    if (userTickets.length === 0) return []
    const eventIds = new Set(userTickets.map(ticket => ticket.eventId))
    return events.filter(event => eventIds.has(event.id))
  }, [userTickets, events])

  const loading = ticketsLoading || eventsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slideUpFromBottom">
        <div>
          <h1 className="text-2xl mb-1">
            <span className="text-white">Olá, </span>
            <span className="text-purple-500 font-bold">{userName || 'Usuário'}</span>
            <span className="ml-2">👋</span>
          </h1>
          <p className="text-gray-300 text-sm">{userEmail || ''}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 card-hover animate-slideUpFromBottom delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Meus Ingressos</p>
              <p className="text-3xl font-bold text-white">{userTickets.length}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Ticket className="w-8 h-8 text-green-500 icon-hover" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 card-hover animate-slideUpFromBottom delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Eventos Disponíveis</p>
              <p className="text-3xl font-bold text-white">{userEvents.length}</p>
            </div>
            <div className="bg-blue-400/20 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-400 icon-hover" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 card-hover animate-slideUpFromBottom delay-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Status do Perfil</p>
              <p className="text-lg font-semibold text-white">Ativo</p>
            </div>
            <div className="bg-purple-400/20 p-3 rounded-lg">
              <User className="w-8 h-8 text-purple-400 icon-hover" />
            </div>
          </div>
        </div>
      </div>

      {/* My Tickets */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 animate-slideUpFromBottom delay-200">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Ticket className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-white">Meus Ingressos</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-400">Carregando...</div>
        ) : userTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-500 icon-hover" />
            <p className="text-lg mb-2">Nenhum ingresso ainda</p>
            <p className="text-sm text-gray-500">Explore os eventos disponíveis e garanta seu ingresso!</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTickets.map((ticket, index) => {
                // Usar Map para lookup O(1) em vez de find O(n)
                const event = eventsMap.get(ticket.eventId)
                const eventName = event?.name || event?.title || 'N/A'
                const isUsed = ticket.status === 'used'
                const statusClass = isUsed
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                  : ticket.status === 'valid' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : ticket.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                const statusText = isUsed ? 'Validado' : ticket.status === 'valid' ? 'Válido' : ticket.status === 'pending' ? 'Pendente' : 'Inválido'
                const ticketHash = ticket.hash || ticket.code
                
                return (
                  <div
                    key={ticket.id}
                    className={`ticket-card ticket-card-hover animate-slideUpFromBottom ${isUsed ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5' : ticketHash ? 'cursor-pointer hover:border-green-500/50' : ''}`}
                    style={{ 
                      animationDelay: `${(index * 0.1)}s`,
                      opacity: 0
                    }}
                    onClick={() => {
                      if (ticketHash && !isUsed) {
                        setSelectedTicket({ id: ticket.id, hash: ticketHash })
                        setShowQRCode(true)
                      }
                    }}
                  >
                    <div className="ticket-card-content">
                      {/* Header do Ticket */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-500/20">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">NOME</p>
                          <p className="text-lg font-bold text-white">{ticket.buyerName}</p>
                          <p className="text-sm text-gray-400 mt-1">{ticket.buyerEmail}</p>
                        </div>
                        <div className="text-right">
                          {isUsed ? (
                            <div className="relative">
                              <Ticket className="w-8 h-8 text-blue-500" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800"></div>
                            </div>
                          ) : (
                            <Ticket className="w-8 h-8 text-purple-500" />
                          )}
                        </div>
                      </div>

                      {/* Informações do Evento */}
                      <div className="mb-4 pb-4 border-b border-purple-500/20">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">EVENTO</p>
                        <p className="text-base font-semibold text-white">{eventName}</p>
                      </div>

                      {/* Status e Data */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">STATUS</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DATA</p>
                          <p className="text-xs text-gray-300">{ticket.purchaseDate}</p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="pt-4 border-t border-purple-500/20 space-y-2">
                        {ticketHash && !isUsed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation() // Evitar que o clique no botão também dispare o clique do card
                              setSelectedTicket({ id: ticket.id, hash: ticketHash })
                              setShowQRCode(true)
                            }}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 rounded-lg font-medium transition-colors text-sm"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Ver QR Code
                          </button>
                        )}
                        {!ticketHash && !isUsed && (
                          <div className="text-center py-2">
                            <p className="text-xs text-gray-500">Hash não disponível</p>
                          </div>
                        )}
                        {isUsed && (
                          <div className="text-center py-2">
                            <p className="text-xs text-blue-400 flex items-center justify-center gap-1">
                              <Ticket className="w-4 h-4" />
                              Ticket já validado
                            </p>
                          </div>
                        )}
                        {ticket.pdfUrl && (
                          <a
                            href={ticket.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg font-medium transition-colors text-sm"
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            Ver PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && userId && (
        <TicketQRCode
          ticketHash={selectedTicket.hash}
          ticketId={selectedTicket.id}
          userId={userId}
          isOpen={showQRCode}
          onClose={() => {
            setShowQRCode(false)
            setSelectedTicket(null)
          }}
          onValidated={async () => {
            // Recarregar tickets após validação
            if (userEmail) {
              try {
                const userResponse = await usersService.getUser({ email: userEmail })
                const user = Array.isArray(userResponse) ? userResponse[0] : userResponse
                if (user && user.id) {
                  const userId = typeof user.id === 'string' ? user.id : String(user.id)
                  await fetchTicketsByUserId(userId)
                }
              } catch (err) {
                console.error('Erro ao recarregar tickets', err)
              }
            }
          }}
        />
      )}
    </div>
  )
}

