import { useState, useEffect } from 'react'
import { Ticket, Plus, Trash2, X, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'
import SearchBar from '../components/SearchBar'
import { useTicketTypes } from '../hooks/useTicketTypes'
import { useErrorNotification } from '../hooks/useErrorNotification'
import { authService } from '../services/auth'
import { usersService } from '../services/users'

export default function TiposTicket() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    endDate: '',
    endTime: '',
    quantity: '',
  })

  const { ticketTypes, loading, fetchTicketTypes, createTicketType, deleteTicketType } = useTicketTypes()
  const { showError } = useErrorNotification()

  useEffect(() => {
    fetchTicketTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTicketTypes = ticketTypes.filter(ticketType =>
    ticketType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticketType.price || '').includes(searchTerm)
  )

  const handleDeleteClick = (id: string, name: string) => {
    setTicketTypeToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!ticketTypeToDelete) return
    
    try {
      await deleteTicketType(ticketTypeToDelete.id)
      setShowDeleteModal(false)
      setTicketTypeToDelete(null)
    } catch (err) {
      showError('Erro ao deletar tipo de ticket')
      setShowDeleteModal(false)
      setTicketTypeToDelete(null)
    }
  }

  const handleCreateTicketType = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      // Validações
      if (!formData.name || !formData.price || !formData.endDate || !formData.endTime) {
        showError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (!formData.quantity) {
        showError('Por favor, informe a quantidade')
        return
      }

      // Obter companyId do usuário logado
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

      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        showError('O preço deve ser um número válido maior ou igual a zero')
        return
      }

      const quantity = parseInt(formData.quantity, 10)
      if (isNaN(quantity) || quantity <= 0) {
        showError('A quantidade deve ser um número maior que zero')
        return
      }

      // Combinar data e hora em ISO string
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      if (isNaN(endDateTime.getTime())) {
        showError('Por favor, insira uma data e hora válidas')
        return
      }

      await createTicketType({
        name: formData.name,
        price: price,
        endDate: endDateTime.toISOString(),
        companyId: companyId,
        quantity: quantity,
      })
      
      setShowCreateModal(false)
      setFormData({
        name: '',
        price: '',
        endDate: '',
        endTime: '',
        quantity: '',
      })
      fetchTicketTypes() // Recarregar tipos de ticket após criar
    } catch (err) {
      showError('Erro ao criar tipo de ticket. Verifique os dados e tente novamente.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tipos de Ticket</h1>
          <p className="text-gray-400">Gerencie os tipos de ticket disponíveis</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Novo Tipo de Ticket
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Buscar por nome ou preço..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Error Messages */}

      {/* Ticket Types Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Preço</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Data Limite</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-gray-400">Carregando...</p>
                  </td>
                </tr>
              ) : filteredTicketTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="w-20 h-20 text-gray-600 mb-4 opacity-30" />
                      <p className="text-gray-400 text-lg">Nenhum tipo de ticket encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTicketTypes.map((ticketType) => (
                  <tr key={ticketType.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{ticketType.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary-400 font-semibold">{formatPrice(ticketType.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{ticketType.endDate ? formatDate(ticketType.endDate) : 'Não informado'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{ticketType.quantity || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteClick(String(ticketType.id), ticketType.name)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        title="Deletar tipo de ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Type Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Criar Novo Tipo de Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicketType} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Tipo de Ticket *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: VIP, Padrão, Estudante"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantidade *
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
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Limite *
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
                    Hora Limite *
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
                  {loading ? 'Criando...' : 'Criar Tipo de Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketTypeToDelete && (
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
                  Tem certeza que deseja excluir o tipo de ticket <span className="font-semibold text-white">"{ticketTypeToDelete.name}"</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setTicketTypeToDelete(null)
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
                  {loading ? 'Excluindo...' : 'Excluir Tipo de Ticket'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

