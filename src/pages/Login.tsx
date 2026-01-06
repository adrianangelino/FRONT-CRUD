import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { API_BASE_URL } from '../config/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [persistedError, setPersistedError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Carregar erro persistido ao montar o componente
  useEffect(() => {
    const savedError = localStorage.getItem('login_error')
    if (savedError) {
      setPersistedError(savedError)
      // Limpar após mostrar
      setTimeout(() => {
        localStorage.removeItem('login_error')
        setPersistedError(null)
      }, 30000) // Manter por 30 segundos
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true)
      // Remover o parâmetro da URL
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await login(formData)
      if (response.access_token) {
        navigate('/admin/dashboard')
      }
    } catch (err: any) {
      // Salvar erro no localStorage para persistir mesmo após reload
      const errorMessage = err?.message || 'Erro desconhecido ao fazer login'
      const errorDetails = {
        message: errorMessage,
        status: err?.status,
        timestamp: new Date().toISOString(),
        email: formData.email,
        stack: err?.stack,
        fullError: err?.toString(),
      }
      
      localStorage.setItem('login_error', errorMessage)
      localStorage.setItem('login_error_details', JSON.stringify(errorDetails))
      
      // Tentar stringify do erro completo
      try {
        const serialized = JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        localStorage.setItem('login_error_full', serialized)
      } catch (stringifyError) {
        // Erro ao serializar
      }
      
      // Atualizar estado para mostrar erro persistido
      setPersistedError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-lg mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EventosPro</h1>
          <p className="text-gray-400">Admin Panel - Faça login para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Conta criada com sucesso! Faça login para continuar.</span>
              </div>
            )}

            {/* Error Message - Mantém visível */}
            {(error || persistedError) && (
              <div className="bg-red-500/20 border-2 border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-bold text-base mb-2">{error || persistedError}</p>
                    <div className="mt-2 pt-2 border-t border-red-500/30 text-xs space-y-1">
                      <p className="text-red-300 font-semibold">⚠️ Erro persistido no localStorage</p>
                      <p className="text-red-300/80">Abra o console do navegador (F12) e execute:</p>
                      <code className="block bg-gray-900 px-2 py-1 rounded mt-1 text-red-300 font-mono text-xs">
                        localStorage.getItem('login_error')
                      </code>
                      <code className="block bg-gray-900 px-2 py-1 rounded mt-1 text-red-300 font-mono text-xs">
                        JSON.parse(localStorage.getItem('login_error_details'))
                      </code>
                      {(error || persistedError)?.includes('conectar ao servidor') && (
                        <>
                          <p className="text-red-300 mt-2 font-semibold">Verifique:</p>
                          <ul className="list-disc list-inside space-y-1 text-red-300/80">
                            <li>O backend está rodando na porta 3000?</li>
                            <li>A URL está correta? ({API_BASE_URL})</li>
                            <li>Há algum firewall bloqueando a conexão?</li>
                            <li>O CORS está configurado no backend?</li>
                          </ul>
                        </>
                      )}
                      <button
                        onClick={() => {
                          localStorage.removeItem('login_error')
                          localStorage.removeItem('login_error_details')
                          localStorage.removeItem('login_error_full')
                          setPersistedError(null)
                        }}
                        className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                      >
                        Limpar erro persistido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              icon={<LogIn className="w-4 h-4" />}
              className="w-full justify-center"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary-500 hover:text-primary-400 font-medium"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

