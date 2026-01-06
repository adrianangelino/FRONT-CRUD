import { useState, useEffect } from 'react'
import { Building2, Calendar, Ticket, TrendingUp, Loader2, DollarSign } from 'lucide-react'
import { companyService, CompanySummary } from '../services/company'

export default function CompanyProfile() {
  const [companyData, setCompanyData] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true)
        const data = await companyService.getMyCompany()
        setCompanyData(data)
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar dados da empresa')
      } finally {
        setLoading(false)
      }
    }

    loadCompanyData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !companyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="hidden">
          {error || 'Não foi possível carregar os dados da empresa'}
        </div>
      </div>
    )
  }

  // Calcular totais a partir dos eventos e ticketTypes
  let totalTicketsLimit = 0 // Total de ingressos disponíveis (soma dos limits)
  let totalTicketsSold = 0 // Total de ingressos vendidos (soma dos sold)
  let totalRevenue = 0 // Total lucrado (soma de price * sold)

  companyData.events.forEach(event => {
    event.ticketTypes.forEach(ticketType => {
      totalTicketsLimit += ticketType.limit
      totalTicketsSold += ticketType.sold
      totalRevenue += ticketType.price * ticketType.sold
    })
  })

  // Calcular porcentagens
  const ticketsSoldPercentage = totalTicketsLimit > 0 
    ? (totalTicketsSold / totalTicketsLimit) * 100 
    : 0
  
  const ticketsRemaining = totalTicketsLimit - totalTicketsSold
  const ticketsRemainingPercentage = totalTicketsLimit > 0 
    ? (ticketsRemaining / totalTicketsLimit) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Perfil da Empresa</h1>
          <p className="text-gray-400">Informações e estatísticas da sua empresa</p>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{companyData.name}</h2>
            <p className="text-gray-400">ID: {companyData.id}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total de Eventos</p>
              <p className="text-white text-3xl font-bold">{companyData.totalEvents}</p>
            </div>
            <Calendar className="w-10 h-10 text-primary-500 opacity-80" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total de Ingressos</p>
              <p className="text-white text-3xl font-bold">{totalTicketsLimit}</p>
            </div>
            <Ticket className="w-10 h-10 text-purple-500 opacity-80" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Ingressos Vendidos</p>
              <p className="text-white text-3xl font-bold">{totalTicketsSold}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-80" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Lucrado</p>
              <p className="text-white text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Eventos e Tipos de Ingresso</h2>
        
        {companyData.events.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-30" />
            <p className="text-gray-400">Nenhum evento encontrado</p>
          </div>
        ) : (
          companyData.events.map((event) => {
            // Calcular totais para este evento
            const eventTotalLimit = event.ticketTypes.reduce((sum, tt) => sum + tt.limit, 0)
            const eventTotalSold = event.ticketTypes.reduce((sum, tt) => sum + tt.sold, 0)
            const eventRevenue = event.ticketTypes.reduce((sum, tt) => sum + (tt.price * tt.sold), 0)
            const eventSoldPercentage = eventTotalLimit > 0 ? (eventTotalSold / eventTotalLimit) * 100 : 0

            return (
              <div key={event.eventId} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{event.eventName}</h3>
                    <p className="text-gray-400 text-sm">ID: {event.eventId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Receita do Evento</p>
                    <p className="text-green-400 text-2xl font-bold">R$ {eventRevenue.toFixed(2)}</p>
                  </div>
                </div>

                {/* Event Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Disponível</p>
                    <p className="text-white text-xl font-bold">{eventTotalLimit}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Vendidos</p>
                    <p className="text-green-400 text-xl font-bold">{eventTotalSold}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Taxa de Vendas</p>
                    <p className="text-primary-400 text-xl font-bold">{eventSoldPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Tipos de Ingresso</h4>
                  {event.ticketTypes.map((ticketType) => {
                    const ticketTypeSoldPercentage = ticketType.limit > 0 
                      ? (ticketType.sold / ticketType.limit) * 100 
                      : 0
                    const ticketTypeRevenue = ticketType.price * ticketType.sold

                    return (
                      <div key={ticketType.ticketTypeId} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-white font-semibold">{ticketType.ticketTypeName}</h5>
                            <p className="text-gray-400 text-sm">Preço: R$ {ticketType.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Receita</p>
                            <p className="text-green-400 font-bold">R$ {ticketTypeRevenue.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Vendidos: {ticketType.sold} / {ticketType.limit}</span>
                            <span className="text-primary-400 font-semibold">{ticketTypeSoldPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2.5">
                            <div
                              className="bg-primary-500 h-2.5 rounded-full transition-all"
                              style={{ width: `${ticketTypeSoldPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Sales Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Vendas de Ingressos (Geral)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Vendidos</span>
                <span className="text-green-400 font-semibold">
                  {totalTicketsSold} ({ticketsSoldPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${ticketsSoldPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Disponíveis</span>
                <span className="text-gray-400 font-semibold">
                  {ticketsRemaining} ({ticketsRemainingPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-gray-500 h-4 rounded-full transition-all"
                  style={{ width: `${ticketsRemainingPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Receita por Evento</h3>
          <div className="space-y-3">
            {companyData.events.map((event) => {
              const eventRevenue = event.ticketTypes.reduce((sum, tt) => sum + (tt.price * tt.sold), 0)
              const maxRevenue = Math.max(...companyData.events.map(e => 
                e.ticketTypes.reduce((sum, tt) => sum + (tt.price * tt.sold), 0)
              ), 1)
              const revenuePercentage = maxRevenue > 0 ? (eventRevenue / maxRevenue) * 100 : 0

              return (
                <div key={event.eventId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate flex-1 mr-2">{event.eventName}</span>
                    <span className="text-green-400 font-semibold">
                      R$ {eventRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${revenuePercentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg p-6 border border-primary-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
          <div>
            <p className="text-sm text-gray-400 mb-1">Taxa de Vendas</p>
            <p className="text-2xl font-bold text-white">
              {ticketsSoldPercentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Ingressos Restantes</p>
            <p className="text-2xl font-bold text-white">
              {ticketsRemaining}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Lucrado</p>
            <p className="text-2xl font-bold text-green-400">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

