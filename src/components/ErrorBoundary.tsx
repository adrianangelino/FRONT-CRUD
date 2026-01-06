import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, _errorInfo: any) {
    // Ignorar erros específicos do scanner QR code
    if (error.message?.includes('removeChild') || error.message?.includes('NotFoundError')) {
      // Este é um erro conhecido do conflito entre React e html5-qrcode
      // Não precisamos fazer nada, apenas ignorar
      return
    }
  }

  render() {
    if (this.state.hasError) {
      // Ignorar erros específicos do scanner QR code
      if (this.state.error?.message?.includes('removeChild') || 
          this.state.error?.message?.includes('NotFoundError')) {
        // Resetar o erro e continuar renderizando normalmente
        this.setState({ hasError: false, error: null })
        return this.props.children
      }
      
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Algo deu errado</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'Ocorreu um erro inesperado'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

