import { db } from '@/config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Proposal } from './proposalService';

export interface ProposalLink {
  id?: string;
  proposalId: string;
  status: 'pending' | 'accepted' | 'declined' | 'paid';
  paymentId?: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export const proposalLinkService = {
  // Criar link para proposta
  async createProposalLink(proposal: Proposal): Promise<ProposalLink> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // Link válido por 7 dias

      const linkData = {
        proposalId: proposal.id!,
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expirationDate)
      };

      const docRef = await addDoc(collection(db, 'proposalLinks'), linkData);
      return {
        id: docRef.id,
        ...linkData,
        createdAt: linkData.createdAt.toDate(),
        updatedAt: linkData.updatedAt.toDate(),
        expiresAt: linkData.expiresAt.toDate()
      };
    } catch (error) {
      console.error('Erro ao criar link da proposta:', error);
      throw error;
    }
  },

  // Buscar link da proposta
  async getProposalLink(linkId: string): Promise<ProposalLink | null> {
    try {
      const docRef = doc(db, 'proposalLinks', linkId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        expiresAt: data.expiresAt.toDate()
      } as ProposalLink;
    } catch (error) {
      console.error('Erro ao buscar link da proposta:', error);
      throw error;
    }
  },

  // Atualizar status do link
  async updateLinkStatus(linkId: string, status: ProposalLink['status'], paymentData?: { paymentId: string, paymentStatus: string }): Promise<void> {
    try {
      const docRef = doc(db, 'proposalLinks', linkId);
      const updateData = {
        status,
        updatedAt: Timestamp.now(),
        ...(paymentData && { 
          paymentId: paymentData.paymentId,
          paymentStatus: paymentData.paymentStatus
        })
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar status do link:', error);
      throw error;
    }
  },

  // Gerar URL pública da proposta
  generatePublicUrl(linkId: string): string {
    // Substitua com seu domínio real
    return `${window.location.origin}/proposta/${linkId}`;
  },

  // Enviar proposta por WhatsApp
  async sendProposalWhatsApp(phoneNumber: string, proposalUrl: string, clientName: string): Promise<void> {
    try {
      // Formatar número de telefone
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Formatar mensagem
      const message = `Olá ${clientName}! 👋\n\n`
        + `Sua proposta está pronta para análise! 📄\n\n`
        + `Acesse o link abaixo para visualizar os detalhes e confirmar:\n`
        + `${proposalUrl}\n\n`
        + `O link é válido por 7 dias.\n\n`
        + `Aguardamos seu retorno! 🤝`;

      // Codificar mensagem para URL
      const encodedMessage = encodeURIComponent(message);
      
      // Gerar link do WhatsApp
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      
      // Abrir link em nova aba
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  },

  // Formatar número de telefone para o formato do WhatsApp
  formatPhoneNumber(phone: string): string {
    // Remover todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Se o número já começar com 55 (Brasil), retornar como está
    if (numbers.startsWith('55')) {
      return numbers;
    }
    
    // Se o número começar com 0, remover o 0
    if (numbers.startsWith('0')) {
      return '55' + numbers.substring(1);
    }
    
    // Se o número não começar com 55, adicionar o código do Brasil
    return '55' + numbers;
  },

  // Criar preferência de pagamento no Mercado Pago
  async createPaymentPreference(proposal: Proposal, linkId: string): Promise<string> {
    try {
      // Aqui você deve implementar a chamada para sua API backend
      // que irá criar a preferência de pagamento no Mercado Pago
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          linkId: linkId,
          title: `Proposta - ${proposal.client}`,
          price: proposal.value,
          description: proposal.description || 'Pagamento de proposta'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();
      return data.preferenceId;
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw error;
    }
  }
}; 