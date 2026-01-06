import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Eye, X, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'
import SearchBar from '../components/SearchBar'
import { useEvents } from '../hooks/useEvents'
import { eventsService } from '../services/events'
import { companiesService, Company } from '../services/companies'
import { ticketTypesService, TicketType } from '../services/ticketTypes'

export default function Eventos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    companyId: '',
    quantity: '',
    ticketTypeId: '',
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { events, loading, error, fetchEvents, deleteEvent, createEvent, updateEvent, getEventById } = useEvents()

  useEffect(() => {
    fetchEvents().catch(() => {})
    loadCompanies()
    loadTicketTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAllCompanies()
      setCompanies(data)
    } catch (err: any) {
      // Rota não existe no backend - não exibir erro
      // O usuário ainda pode criar eventos mesmo sem empresas carregadas
      setCompanies([])
    }
  }

  const loadTicketTypes = async () => {
    try {
      const data = await ticketTypesService.getAllTicketTypes()
      setTicketTypes(data.map(ticketTypesService.mapToTicketType))
    } catch (err: any) {
      // Não definir erro como mensagem crítica, apenas logar
      // O usuário ainda pode criar eventos mesmo sem tipos de ticket carregados
      if (err?.message && !err.message.includes('conexão')) {
        setErrorMessage(`Aviso: Não foi possível carregar a lista de tipos de ticket. ${err.message}`)
      }
    }
  }

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = async (id: string) => {
    try {
      const event = await getEventById(id)
      setEditingEventId(id)
      
      // Converter as datas para o formato do formulário
      let startDate = ''
      let startTime = ''
      let endDate = ''
      let endTime = ''
      
      // Buscar o evento completo do backend para obter startDate e endDate
      const fullEvent = await eventsService.getEventById(id)
      if (fullEvent.startDate) {
        const start = new Date(fullEvent.startDate)
        startDate = start.toISOString().split('T')[0]
        startTime = start.toTimeString().slice(0, 5)
      }
      if (fullEvent.endDate) {
        const end = new Date(fullEvent.endDate)
        endDate = end.toISOString().split('T')[0]
        endTime = end.toTimeString().slice(0, 5)
      }
      
      setFormData({
        name: fullEvent.name || event.title || '',
        startDate,
        startTime,
        endDate,
        endTime,
        companyId: fullEvent.companyId ? String(fullEvent.companyId) : '',
        quantity: fullEvent.quantity ? String(fullEvent.quantity) : '',
        ticketTypeId: fullEvent.ticketTypeId ? String(fullEvent.ticketTypeId) : '',
      })
      setShowEditModal(true)
    } catch (err) {
      setErrorMessage('Erro ao carregar dados do evento')
    }
  }

  const handleDeleteClick = (id: string, title: string) => {
    setEventToDelete({ id, title })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    
    try {
      await deleteEvent(eventToDelete.id)
      setShowDeleteModal(false)
      setEventToDelete(null)
    } catch (err) {
      setErrorMessage('Erro ao deletar evento')
      setShowDeleteModal(false)
      setEventToDelete(null)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      // Validações
      if (!formData.name || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        setErrorMessage('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (!formData.companyId || !formData.quantity || !formData.ticketTypeId) {
        setErrorMessage('Por favor, selecione a empresa, quantidade e tipo de ticket')
        return
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        setErrorMessage('Por favor, insira datas e horários válidos')
        return
      }

      if (endDateTime <= startDateTime) {
        setErrorMessage('A data de término deve ser posterior à data de início')
        return
      }

      const quantity = parseInt(formData.quantity, 10)
      if (isNaN(quantity) || quantity <= 0) {
        setErrorMessage('A quantidade deve ser um número maior que zero')
        return
      }

      await createEvent({
        name: formData.name,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        companyId: parseInt(formData.companyId, 10),
        quantity,
        ticketTypeId: parseInt(formData.ticketTypeId, 10),
      })
      
      setShowCreateModal(false)
      setFormData({
        name: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        companyId: '',
        quantity: '',
        ticketTypeId: '',
      })
      fetchEvents() // Recarregar eventos após criar
    } catch (err) {
      setErrorMessage('Erro ao criar evento. Verifique os dados e tente novamente.')
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!editingEventId) return

    try {
      // Converter data e hora para o formato ISO esperado pelo backend
      if (!formData.name || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        setErrorMessage('Por favor, preencha todos os campos obrigatórios')
        return
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        setErrorMessage('Por favor, insira datas e horários válidos')
        return
      }

      if (endDateTime <= startDateTime) {
        setErrorMessage('A data de término deve ser posterior à data de início')
        return
      }

      const updateData: any = {
        name: formData.name,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      }

      // Incluir campos opcionais se preenchidos
      if (formData.companyId) {
        updateData.companyId = parseInt(formData.companyId, 10)
      }
      if (formData.quantity) {
        const quantity = parseInt(formData.quantity, 10)
        if (!isNaN(quantity) && quantity > 0) {
          updateData.quantity = quantity
        }
      }
      if (formData.ticketTypeId) {
        updateData.ticketTypeId = parseInt(formData.ticketTypeId, 10)
      }

      await updateEvent(editingEventId, updateData)
      
      setShowEditModal(false)
      setEditingEventId(null)
      setFormData({
        name: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        companyId: '',
        quantity: '',
        ticketTypeId: '',
      })
      fetchEvents() // Recarregar eventos após atualizar
    } catch (err) {
      setErrorMessage('Erro ao atualizar evento. Verifique os dados e tente novamente.')
    }
  }

  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    soldTickets: events.reduce((sum, e) => sum + e.soldTickets, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Eventos</h1>
          <p className="text-gray-400">Gerencie todos os eventos</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Novo Evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total de Eventos</p>
          <p className="text-white text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Eventos Ativos</p>
          <p className="text-green-500 text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total de Ingressos Vendidos</p>
          <p className="text-primary-500 text-2xl font-bold">{stats.soldTickets}</p>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Buscar eventos..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Error Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => {}}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Evento</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Data</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Local</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Preço</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ingressos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhum evento encontrado
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Calendar className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-gray-400 text-sm line-clamp-1">{event.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{event.date}</p>
                      <p className="text-gray-400 text-sm">{event.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      {event.location && event.location !== 'Local não informado' ? (
                        <>
                          <p className="text-white text-sm">{event.location.split(',')[0]}</p>
                          {event.location.includes(',') && (
                            <p className="text-gray-400 text-sm">{event.location.split(',').slice(1).join(',').trim()}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm">Local não informado</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">
                        {event.price > 0 ? formatPrice(event.price) : 'Gratuito'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {event.totalTickets > 0 ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-white">{event.soldTickets}/{event.totalTickets}</span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            {event.totalTickets - event.soldTickets} disponíveis
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm">Sem limite</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        event.status === 'active' 
                          ? 'bg-green-500/20 text-green-400'
                          : event.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <Eye className="w-3 h-3" />
                        {event.status === 'active' ? 'Ativo' : event.status === 'cancelled' ? 'Cancelado' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditClick(event.id)}
                          className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(event.id, event.title)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Criar Novo Evento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Show de Rock"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Término *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Empresa *
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantidade de Ingressos *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Ticket *
                  </label>
                  <select
                    required
                    value={formData.ticketTypeId}
                    onChange={(e) => setFormData({ ...formData, ticketTypeId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione um tipo</option>
                    {ticketTypes.map((ticketType) => (
                      <option key={ticketType.id} value={ticketType.id}>
                        {ticketType.name} - R$ {ticketType.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {loading ? 'Criando...' : 'Criar Evento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEventId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Editar Evento</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingEventId(null)
                  setFormData({
                    name: '',
                    startDate: '',
                    startTime: '',
                    endDate: '',
                    endTime: '',
                    companyId: '',
                    quantity: '',
                    ticketTypeId: '',
                  })
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Show de Rock"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hora de Término *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Empresa
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantidade de Ingressos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Ticket
                  </label>
                  <select
                    value={formData.ticketTypeId}
                    onChange={(e) => setFormData({ ...formData, ticketTypeId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione um tipo</option>
                    {ticketTypes.map((ticketType) => (
                      <option key={ticketType.id} value={ticketType.id}>
                        {ticketType.name} - R$ {ticketType.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingEventId(null)
                    setFormData({
                      name: '',
                      startDate: '',
                      startTime: '',
                      endDate: '',
                      endTime: '',
                      companyId: '',
                      quantity: '',
                      ticketTypeId: '',
                    })
                  }}
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
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
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
                  Tem certeza que deseja excluir o evento <span className="font-semibold text-white">"{eventToDelete.title}"</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setEventToDelete(null)
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
                  {loading ? 'Excluindo...' : 'Excluir Evento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

