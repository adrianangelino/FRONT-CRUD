export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image?: string;
  totalTickets: number;
  soldTickets: number;
  status: 'active' | 'inactive' | 'cancelled';
}

export interface Ticket {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  buyerName: string;
  buyerEmail: string;
  purchaseDate: string;
  status: 'valid' | 'used' | 'cancelled';
  price?: number; // Preço do ticket
}

export interface User {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  role: 'admin' | 'user';
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  soldTickets: number;
  registeredUsers: number;
  estimatedRevenue: number;
}

