import { Timestamp } from 'firebase/firestore';

export type ProposalStatus = 
  | 'pending'
  | 'waiting_client'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'payment_failed';

export interface Proposal {
  id: string;
  client: string;
  phone: string;
  value: number;
  date: Date;
  category: string;
  type: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid' | 'payment_pending' | 'payment_failed';
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  paymentId?: string;
  paymentDate?: Timestamp;
  paymentStatus?: 'approved' | 'pending' | 'rejected' | 'in_process' | string;
  paymentStatusDetail?: string;
  lastPaymentUpdate?: Timestamp;
  linkExpiresAt?: Timestamp;
  linkStatus?: 'pending' | 'paid' | 'expired';
}

export type ProposalCategory = 'Sites' | 'Configuração e Manutenção' | 'Infraestrutura';

export type ProposalType = 
  | 'Landing Page'
  | 'Ecommerce'
  | 'Sistema Web'
  | 'Computador'
  | 'Notebook'
  | 'Impressora'
  | 'Configuração de equipamentos de rede'
  | 'Passagem de Cabos';

export const proposalCategories: Record<ProposalCategory, ProposalType[]> = {
  'Sites': ['Landing Page', 'Ecommerce', 'Sistema Web'],
  'Configuração e Manutenção': ['Computador', 'Notebook', 'Impressora'],
  'Infraestrutura': ['Configuração de equipamentos de rede', 'Passagem de Cabos']
} as const;

export interface CreateProposalInput {
  client: string;
  phone?: string;
  value: number;
  date: Date | string;
  category: ProposalCategory;
  type: ProposalType;
  description?: string;
  userId: string;
}

export interface ProposalFormData {
  phone: string;
  value: number;
  date: Date | string;
  category: ProposalCategory;
  type: ProposalType;
  description?: string;
  client: string;
} 