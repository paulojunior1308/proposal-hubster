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
  category: ProposalCategory;
  type: ProposalType;
  description: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid' | 'payment_failed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
  paymentDate?: Date;
  paymentStatus?: string;
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