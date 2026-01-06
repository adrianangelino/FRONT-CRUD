import { ApiError } from '../services/api'

/**
 * Extrai a mensagem de erro amigável para o usuário final
 * Remove detalhes técnicos e retorna apenas o motivo do erro
 */
export function getErrorMessage(error: unknown): string {
  // Se for um ApiError
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError
    
    // Priorizar a mensagem do backend (mais específica)
    if (apiError.errorData?.message) {
      return apiError.errorData.message
    }
    
    // Se não tiver errorData.message, usar a message principal
    if (apiError.message) {
      // Remover prefixos técnicos como "Erro 400:", "Erro 500:", etc
      const cleanMessage = apiError.message.replace(/^Erro \d+:\s*/i, '')
      return cleanMessage
    }
  }
  
  // Se for uma string
  if (typeof error === 'string') {
    return error
  }
  
  // Se for um Error padrão
  if (error instanceof Error) {
    return error.message
  }
  
  // Mensagem padrão
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

/**
 * Determina o tipo de notificação baseado no status do erro
 * Sempre retorna 'error' para destacar todos os erros em vermelho
 */
export function getErrorType(error: unknown): 'error' | 'warning' | 'info' {
  // Sempre retornar 'error' para destacar em vermelho
  return 'error'
}

