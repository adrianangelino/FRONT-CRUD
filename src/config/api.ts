// Configuração da API
// Em desenvolvimento, usa URL relativa para o proxy do Vite funcionar
// Em produção, usa a URL completa do backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? '' : 'http://localhost:3000')


export const API_ENDPOINTS = {
  // Events
  CREATE_EVENT: '/events/create-events',
  GET_ALL_EVENTS: '/events/getAllEvents',
  GET_EVENT_BY_ID: (id: string) => `/events/getEventById/${id}`,
  UPDATE_EVENT: (id: string) => `/events/updateEvent/${id}`,
  SOFT_DELETE_EVENT: (id: string) => `/events/softDeletedEvent/${id}`,
  
  // Tickets
  CREATE_TICKET: '/ticket/create-ticket',
  CHECK_TICKET: '/ticket/check-ticket',
  GET_ALL_TICKETS: '/ticket/getAlltickets',
  GET_TICKET_BY_USER_NAME: '/ticket/getTicketUserName/',
  GET_TICKET_BY_ID: (id: string) => `/ticket/getTicketById/${id}`,
  SOFT_DELETE_TICKET: (id: string) => `/ticket/softDeleted/${id}`,
  GET_EVENT_TICKET_SUMMARIES: '/ticket/event-ticket-summaries',
  
  // Users
  LOGIN: '/user/login',
  CREATE_USER: '/user/criar-usuario',
  GET_USER: '/user/buscar-usuario',
  GET_ALL_USERS: '/user/getAllUsers',
  DELETE_USER: (id: string) => `/user/ExcluirUsuario/${id}`,
  
  // Companies
  GET_ALL_COMPANIES: '/company/getAllCompanies',
  
  // Ticket Types
  CREATE_TICKET_TYPE: '/ticket-type/crate-ticketType',
  GET_ALL_TICKET_TYPES: '/ticket-type/getAllTicketType',
  GET_TICKET_TYPE_BY_NAME: '/ticket-type/getTickTypeForName',
  SOFT_DELETE_TICKET_TYPE: (id: string) => `/ticket-type/softDeltedTicketType/${id}`,
  
  // Roles
  GET_ALL_ROLES: '/role/getAllRoles',
} as const

