import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { proposalLinkService } from './proposalLinkService';

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

export type ProposalStatus = 'pending' | 'waiting_client' | 'accepted' | 'declined' | 'paid';

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

export interface ProposalUpdateData {
  client?: string;
  phone?: string;
  value?: number;
  category?: ProposalCategory;
  type?: ProposalType;
  description?: string;
  date?: Timestamp;
  status?: ProposalStatus;
  userId?: string;
  updatedAt: Timestamp;
}

export const proposalCategories = {
  'Sites': ['Landing Page', 'Ecommerce', 'Sistema Web'],
  'Configuração e Manutenção': ['Computador', 'Notebook', 'Impressora'],
  'Infraestrutura': ['Configuração de equipamentos de rede', 'Passagem de Cabos']
} as const;

export const proposalService = {
  // Criar proposta
  async createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Proposal> {
    try {
      const proposalData = {
        ...proposal,
        status: 'pending' as ProposalStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        date: Timestamp.fromDate(proposal.date)
      };

      const docRef = await addDoc(collection(db, 'proposals'), proposalData);
      return {
        id: docRef.id,
        ...proposalData,
        createdAt: proposalData.createdAt.toDate(),
        updatedAt: proposalData.updatedAt.toDate(),
        date: proposalData.date.toDate()
      };
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      throw error;
    }
  },

  // Buscar propostas
  async getProposals(userId: string): Promise<Proposal[]> {
    try {
      const proposalsRef = collection(db, 'proposals');
      const q = query(
        proposalsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Proposal[];
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      throw error;
    }
  },

  // Buscar uma proposta específica
  async getProposal(id: string): Promise<Proposal> {
    try {
      const docRef = doc(db, 'proposals', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Proposta não encontrada');
      }

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Proposal;
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      throw error;
    }
  },

  // Atualizar proposta
  async updateProposal(id: string, proposal: Partial<Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Proposal> {
    try {
      const docRef = doc(db, 'proposals', id);
      
      // Criar objeto de atualização com os campos que foram fornecidos
      const updateFields: Record<string, unknown> = {
        updatedAt: Timestamp.now()
      };

      // Adicionar campos que foram fornecidos na proposta
      if (proposal.client) updateFields.client = proposal.client;
      if (proposal.phone) updateFields.phone = proposal.phone;
      if (proposal.value) updateFields.value = proposal.value;
      if (proposal.category) updateFields.category = proposal.category;
      if (proposal.type) updateFields.type = proposal.type;
      if (proposal.description) updateFields.description = proposal.description;
      if (proposal.status) updateFields.status = proposal.status;
      if (proposal.userId) updateFields.userId = proposal.userId;
      if (proposal.date) updateFields.date = Timestamp.fromDate(proposal.date);

      await updateDoc(docRef, updateFields);
      return { id, ...proposal } as Proposal;
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      throw error;
    }
  },

  // Excluir proposta
  async deleteProposal(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'proposals', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      throw error;
    }
  },

  // Enviar proposta para o cliente
  async sendProposalToClient(proposal: Proposal): Promise<string> {
    try {
      // Criar link da proposta
      const link = await proposalLinkService.createProposalLink(proposal);
      
      // Atualizar status da proposta para waiting_client
      await this.updateProposal(proposal.id!, {
        status: 'waiting_client'
      });

      // Enviar WhatsApp
      const publicUrl = proposalLinkService.generatePublicUrl(link.id!);
      await proposalLinkService.sendProposalWhatsApp(
        proposal.phone,
        publicUrl,
        proposal.client
      );

      return publicUrl;
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      throw error;
    }
  },

  // Gerar PDF da proposta
  generateProposalPDF(proposal: Proposal) {
    const doc = new jsPDF();
    
    // Configurações de fonte e cores
    const primaryColor = '#2563eb';
    const secondaryColor = '#475569';
    
    // Cabeçalho
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Proposta Comercial', 20, 25);
    
    // Informações da proposta
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Box com informações principais
    doc.setFillColor('#f8fafc');
    doc.rect(20, 50, doc.internal.pageSize.width - 40, 40, 'F');
    doc.setDrawColor(primaryColor);
    doc.rect(20, 50, doc.internal.pageSize.width - 40, 40, 'S');
    
    doc.setFontSize(10);
    doc.text(`ID: ${proposal.id?.slice(-6)}`, 25, 60);
    doc.text(`Data: ${format(proposal.date, 'dd/MM/yyyy', { locale: ptBR })}`, 25, 70);
    doc.text(`Status: ${
      proposal.status === 'pending' ? 'Pendente' : 
      proposal.status === 'waiting_client' ? 'Aguardando Cliente' :
      proposal.status === 'accepted' ? 'Aceita' :
      proposal.status === 'declined' ? 'Recusada' :
      proposal.status === 'paid' ? 'Paga' : 'Desconhecido'
    }`, 25, 80);
    
    // Informações do cliente
    doc.setFillColor('#f8fafc');
    doc.rect(20, 100, doc.internal.pageSize.width - 40, 50, 'F');
    doc.setDrawColor(primaryColor);
    doc.rect(20, 100, doc.internal.pageSize.width - 40, 50, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Informações do Cliente', 25, 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text(`Cliente: ${proposal.client}`, 25, 130);
    doc.text(`Categoria: ${proposal.category}`, 25, 140);
    
    // Detalhes da proposta
    doc.setFillColor('#f8fafc');
    doc.rect(20, 160, doc.internal.pageSize.width - 40, 70, 'F');
    doc.setDrawColor(primaryColor);
    doc.rect(20, 160, doc.internal.pageSize.width - 40, 70, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Detalhes da Proposta', 25, 175);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text(`Tipo: ${proposal.type}`, 25, 190);
    doc.text(`Valor: ${new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(proposal.value)}`, 25, 205);
    
    // Descrição
    if (proposal.description) {
      doc.setFillColor('#f8fafc');
      doc.rect(20, 240, doc.internal.pageSize.width - 40, 0.5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text('Descrição', 25, 255);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor);
      
      const splitDescription = doc.splitTextToSize(proposal.description, doc.internal.pageSize.width - 50);
      doc.text(splitDescription, 25, 270);
    }
    
    // Rodapé
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(primaryColor);
    doc.rect(0, pageHeight - 20, doc.internal.pageSize.width, 20, 'F');
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor('#ffffff');
    doc.text('Documento gerado automaticamente pelo sistema Hubster', 20, pageHeight - 8);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }), doc.internal.pageSize.width - 60, pageHeight - 8);
    
    // Salvar o PDF
    doc.save(`proposta-${proposal.id?.slice(-6)}.pdf`);
  }
}; 