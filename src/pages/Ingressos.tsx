import { useState, useEffect } from 'react'
import { Plus, Ticket, X, Trash2, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'
import SearchBar from '../components/SearchBar'
import { useTickets } from '../hooks/useTickets'
import { useEvents } from '../hooks/useEvents'
import { useErrorNotification } from '../hooks/useErrorNotification'
import { usersService } from '../services/users'
import { authService } from '../services/auth'
import { eventsService } from '../services/events'
import { ticketsService } from '../services/tickets'
import { Ticket as TicketType } from '../types'
import { TicketResponse } from '../services/tickets'

export default function Ingressos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; code: string } | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [selectedTicketResponse, setSelectedTicketResponse] = useState<TicketResponse | null>(null)
  const [formData, setFormData] = useState({
    eventId: '',
    buyerName: '',
    buyerEmail: '',
  })
  const { tickets, loading, fetchTickets, deleteTicket, createTicket, getTicketByUserNameResponse } = useTickets()
  const { events, fetchEvents } = useEvents()
  const { showError } = useErrorNotification()

  useEffect(() => {
    fetchTickets().catch(() => {
      // Erro já é tratado no hook
    })
    fetchEvents().catch(() => {
      // Erro já é tratado no hook
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTickets = tickets.filter(ticket =>
    (ticket.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ticket.eventTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ticket.buyerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ticket.buyerName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (id: string, code: string) => {
    setTicketToDelete({ id, code })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return
    
    try {
      await deleteTicket(ticketToDelete.id)
      setShowDeleteModal(false)
      setTicketToDelete(null)
    } catch (err) {
      showError('Erro ao deletar ingresso')
      setShowDeleteModal(false)
      setTicketToDelete(null)
    }
  }

  const handleViewDetails = async (buyerName: string) => {
    try {
      const ticketResponse = await getTicketByUserNameResponse(buyerName)
      const ticket = ticketsService.mapToTicket(ticketResponse)
      setSelectedTicket(ticket)
      setSelectedTicketResponse(ticketResponse)
      setShowDetailsModal(true)
    } catch (err) {
      showError('Erro ao carregar detalhes do ingresso')
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validações dos campos obrigatórios
      const eventIdNumber = Number(formData.eventId)
      
      if (isNaN(eventIdNumber) || eventIdNumber <= 0) {
        showError('Por favor, selecione um evento válido')
        return
      }
      
      const buyerName = formData.buyerName?.trim()
      const buyerEmail = formData.buyerEmail?.trim()
      
      if (!buyerName || buyerName.length === 0) {
        showError('Por favor, preencha o nome do comprador')
        return
      }
      
      if (!buyerEmail || buyerEmail.length === 0) {
        showError('Por favor, preencha o email do comprador')
        return
      }
      
      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(buyerEmail)) {
        showError('Por favor, insira um email válido')
        return
      }
      
      // Buscar o usuário comprador pelo email para obter o userId
      let userId: number | null = null
      try {
        const normalizedEmail = buyerEmail.toLowerCase().trim()
        const userResponse = await usersService.getUser({ email: normalizedEmail })
        
        // A resposta pode ser um array ou um objeto único
        const user = Array.isArray(userResponse) ? userResponse[0] : userResponse
        
        if (user && user.id) {
          userId = Number(user.id)
        } else {
          throw new Error('Usuário não encontrado')
        }
      } catch (err) {
        showError(`Usuário com email "${buyerEmail}" não encontrado. Por favor, verifique se o email está correto ou crie o usuário primeiro.`)
        return
      }
      
      if (!userId || isNaN(userId)) {
        showError('Não foi possível obter o ID do usuário. Por favor, tente novamente.')
        return
      }

      // Buscar o evento completo pelo ID para obter ticketTypeId
      let ticketTypeId: number | null = null
      try {
        const fullEvent = await eventsService.getEventById(formData.eventId)
        
        // Verificar se o evento foi retornado
        if (!fullEvent) {
          throw new Error('Evento não encontrado')
        }
        
        // Verificar se tem ticketTypeId
        if (fullEvent.ticketTypeId !== undefined && fullEvent.ticketTypeId !== null) {
          ticketTypeId = Number(fullEvent.ticketTypeId)
        } else {
          // Se não tem ticketTypeId, mostrar erro mais específico
          throw new Error('O evento selecionado não possui um tipo de ticket (ticketTypeId). Verifique se o evento foi criado corretamente.')
        }
      } catch (err: any) {
        // Mostrar a mensagem de erro real
        const errorMsg = err?.message || 'Erro ao buscar dados do evento'
        showError(errorMsg)
        return
      }

      if (!ticketTypeId || isNaN(ticketTypeId)) {
        showError('O evento selecionado não possui um tipo de ticket válido.')
        return
      }

      if (!ticketTypeId || isNaN(ticketTypeId)) {
        showError('O evento selecionado não possui um tipo de ticket válido.')
        return
      }

      // Buscar o companyId do usuário logado (vendedor)
      let companyId: number | null = null
      try {
        const loggedUserEmail = authService.getUserEmail()
        if (!loggedUserEmail) {
          throw new Error('Usuário não está logado')
        }
        
        const loggedUserResponse = await usersService.getUser({ email: loggedUserEmail })
        const loggedUser = Array.isArray(loggedUserResponse) ? loggedUserResponse[0] : loggedUserResponse
        
        if (loggedUser && loggedUser.companyId) {
          companyId = Number(loggedUser.companyId)
        } else {
          throw new Error('Usuário logado não possui companyId')
        }
      } catch (err) {
        showError('Erro ao buscar dados do usuário logado. Por favor, faça login novamente.')
        return
      }

      if (!companyId || isNaN(companyId)) {
        showError('Não foi possível obter a empresa do usuário logado.')
        return
      }
      
      // Preparar dados conforme o backend espera (exatamente como no Insomnia)
      const normalizedEmail = buyerEmail.toLowerCase().trim()
      
      // Garantir que todos os valores são números
      const ticketData = {
        email: normalizedEmail,
        name: buyerName.trim(),
        eventId: Number(eventIdNumber),
        userId: Number(userId),
        companyId: Number(companyId),
        ticketTypeId: Number(ticketTypeId),
      }
      
      // Validar antes de enviar
      if (isNaN(ticketData.eventId) || isNaN(ticketData.userId) || isNaN(ticketData.companyId) || isNaN(ticketData.ticketTypeId)) {
        showError('Erro: Algum dos valores numéricos é inválido. Verifique os dados.')
        return
      }
      
      await createTicket(ticketData)
      setShowCreateModal(false)
      setFormData({
        eventId: '',
        buyerName: '',
        buyerEmail: '',
      })
      fetchTickets()
    } catch (err: any) {
      showError(err?.message || 'Erro ao criar ingresso. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ingressos</h1>
          <p className="text-gray-400">Gerencie todos os ingressos vendidos</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Criar Ingresso
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Buscar por código, evento ou email..."
        value={searchTerm}
        onChange={setSearchTerm}
      />


      {/* Tickets Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Código</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Evento</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Comprador</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Data Compra</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-gray-400">Carregando...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="w-20 h-20 text-gray-600 mb-4 opacity-30" />
                      <p className="text-gray-400 text-lg">Nenhum ingresso encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-mono">{ticket.code}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{ticket.eventTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{ticket.buyerName}</p>
                      <p className="text-gray-400 text-sm">{ticket.buyerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{ticket.purchaseDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        ticket.status === 'valid' 
                          ? 'bg-green-500/20 text-green-400'
                          : ticket.status === 'used'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ticket.status === 'valid' ? 'Válido' : ticket.status === 'used' ? 'Usado' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(ticket.buyerName)}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          Ver detalhes
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(ticket.id, ticket.code)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                          title="Deletar ingresso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Criar Novo Ingresso</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Evento *
                </label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um evento</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Comprador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email do Comprador *
                </label>
                <input
                  type="email"
                  required
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Ingresso'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && selectedTicketResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Detalhes do Ingresso</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedTicket(null)
                  setSelectedTicketResponse(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID do Ingresso
                </label>
                <p className="text-white">{selectedTicketResponse.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Código do Ingresso (Hash)
                </label>
                <p className="text-white font-mono text-sm break-all">{selectedTicketResponse.hash}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nome do Comprador
                </label>
                <p className="text-white">{selectedTicketResponse.name}</p>
              </div>

              {selectedTicketResponse.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Data de Compra e Criação
                  </label>
                  <p className="text-white font-semibold">
                    {new Date(selectedTicketResponse.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Status (Backend)
                </label>
                <p className="text-white capitalize">{selectedTicketResponse.status || 'Não informado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Status (Exibição)
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  selectedTicket.status === 'valid' 
                    ? 'bg-green-500/20 text-green-400'
                    : selectedTicket.status === 'used'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedTicket.status === 'valid' ? 'Válido' : selectedTicket.status === 'used' ? 'Usado' : 'Cancelado'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Data de Exclusão (deletedAt)
                </label>
                <p className="text-white">
                  {selectedTicketResponse.deletedAt 
                    ? new Date(selectedTicketResponse.deletedAt).toLocaleString('pt-BR')
                    : 'Não deletado (null)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID do Evento
                </label>
                <p className="text-white">{selectedTicketResponse.eventId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID do Usuário
                </label>
                <p className="text-white">{selectedTicketResponse.userId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID da Empresa
                </label>
                <p className="text-white">{selectedTicketResponse.companyId || 'Não informado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID do Tipo de Ticket
                </label>
                <p className="text-white">{selectedTicketResponse.ticketTypeId || 'Não informado'}</p>
              </div>

              {selectedTicketResponse.pdfUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    URL do PDF
                  </label>
                  <a 
                    href={selectedTicketResponse.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 underline break-all text-sm"
                  >
                    {selectedTicketResponse.pdfUrl}
                  </a>
                </div>
              )}

              {selectedTicketResponse.price !== undefined && selectedTicketResponse.price !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Preço
                  </label>
                  <p className="text-white">R$ {selectedTicketResponse.price.toFixed(2)}</p>
                </div>
              )}


              {selectedTicketResponse.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Data de Atualização
                  </label>
                  <p className="text-white">{new Date(selectedTicketResponse.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedTicket(null)
                    setSelectedTicketResponse(null)
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
                  <p className="text-gray-400 text-sm mt-1">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">
                  Tem certeza que deseja excluir o ingresso <span className="font-mono font-semibold text-white">"{ticketToDelete.code}"</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setTicketToDelete(null)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={loading}
                >
                  {loading ? 'Excluindo...' : 'Excluir Ingresso'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

