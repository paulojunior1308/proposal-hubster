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
import { Proposal, ProposalStatus, ProposalType, ProposalCategory } from '@/types/proposal';
import { v4 as uuidv4 } from 'uuid';

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

export const proposalCategories: Record<ProposalCategory, ProposalType[]> = {
  'Sites': ['Landing Page', 'Ecommerce', 'Sistema Web'],
  'Configuração e Manutenção': ['Computador', 'Notebook', 'Impressora'],
  'Infraestrutura': ['Configuração de equipamentos de rede', 'Passagem de Cabos']
} as const;

export const proposalService = {
  // Criar proposta
  async createProposal(proposal: Partial<Proposal>): Promise<Proposal> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const proposalData = {
        ...proposal,
        phone: proposal.phone || '',
        status: 'pending' as ProposalStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        client: proposal.client!,
        value: proposal.value!,
        category: proposal.category!,
        type: proposal.type!,
        userId: proposal.userId!,
        id: uuidv4(),
        date: Timestamp.fromDate(proposal.date instanceof Date ? proposal.date : new Date()),
        linkExpiresAt: Timestamp.fromDate(expirationDate),
        paymentId: null,
        linkStatus: 'pending'
      };

      const docRef = await addDoc(collection(db, 'proposals'), proposalData);
      
      // Gerar o link com a URL base correta
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const proposalLink = `${baseUrl}/proposta/${docRef.id}`;

      // Atualizar o documento com o link gerado
      await updateDoc(doc(db, 'proposals', docRef.id), {
        proposalLink
      });

      return {
        ...proposalData,
        id: docRef.id,
        date: proposalData.date.toDate(),
        proposalLink
      } as unknown as Proposal;
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
  async getProposal(id: string): Promise<Proposal | null> {
    try {
      const docRef = doc(db, 'proposals', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      console.log('Dados da proposta:', data); // Debug

      return {
        id: docSnap.id,
        ...data
      } as Proposal;
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      throw error;
    }
  },

  // Atualizar uma proposta
  async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, 'proposals', proposalId), updateData);
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
  async sendProposalToClient(proposal: Proposal): Promise<void> {
    try {
      // Formatar o número de telefone
      const phone = proposal.phone.replace(/\D/g, '');
      const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
      
      // Criar URL da proposta
      const proposalUrl = `${window.location.origin}/proposta/${proposal.id}`;
      
      // Criar mensagem
      const message = `Olá ${proposal.client}! 👋\n\n`
        + `Sua proposta está pronta para análise! 📄\n\n`
        + `Acesse o link abaixo para visualizar os detalhes e confirmar:\n`
        + `${proposalUrl}\n\n`
        + `O link é válido por 7 dias.\n\n`
        + `Aguardamos seu retorno! 🤝`;

      // Atualizar status da proposta
      await this.updateProposal(proposal.id, {
        status: 'waiting_client',
        linkExpiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 dias
      });

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

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
    doc.text(`Data: ${format(proposal.date, 'dd/MM/yyyy')}`, 25, 70);
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
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), doc.internal.pageSize.width - 60, pageHeight - 8);
    
    // Salvar o PDF
    doc.save(`proposta-${proposal.id?.slice(-6)}.pdf`);
  },

  async handleProposalResponse(proposalId: string, accept: boolean): Promise<void> {
    try {
      await this.updateProposal(proposalId, {
        status: accept ? 'accepted' : 'declined',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao processar resposta da proposta:', error);
      throw error;
    }
  },

  // Adicionar método createPaymentPreference
  async createPaymentPreference(proposal: Proposal): Promise<{ preferenceId: string }> {
    try {
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          title: `Proposta - ${proposal.client}`,
          price: proposal.value,
          description: proposal.description
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();
      return { preferenceId: data.preferenceId };
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw error;
    }
  }
}; 