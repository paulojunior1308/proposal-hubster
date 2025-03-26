import { ProposalStatus } from '@/types/proposal';
import { proposalService } from '@/services/proposalService';

interface PaymentWebhookData {
  type: string;
  data: {
    id: string;
    status: string;
    external_reference: string;
  };
}

export interface PaymentResponse {
  status: string;
  external_reference: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const body = await req.json() as PaymentWebhookData;
    
    // Verifica se é uma notificação de pagamento
    if (body.type === 'payment') {
      const payment = body.data;
      
      // Atualiza o status da proposta baseado no status do pagamento
      if (payment.status === 'approved') {
        await proposalService.updateProposal(payment.external_reference, {
          status: 'paid' as ProposalStatus
        });
      } else if (payment.status === 'rejected') {
        await proposalService.updateProposal(payment.external_reference, {
          status: 'payment_failed' as ProposalStatus
        });
      }
    }
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response('Erro ao processar webhook', { status: 500 });
  }
} 