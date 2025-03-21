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

export type ProposalStatus = 
  | 'pending'
  | 'waiting_client'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'payment_failed';

export interface Proposal {
  id?: string;
  client: string;
  phone: string;
  value: number;
  category: ProposalCategory;
  type: ProposalType;
  description?: string;
  date: Date;
  status: ProposalStatus;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
} 