import { proposalService } from '@/services/proposalService';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Verifica se é uma notificação de pagamento
    if (body.type === 'payment') {
      const payment = body.data;
      
      // Atualiza o status da proposta baseado no status do pagamento
      if (payment.status === 'approved') {
        await proposalService.updateProposal(payment.external_reference, {
          status: 'paid'
        });
      } else if (payment.status === 'rejected') {
        await proposalService.updateProposal(payment.external_reference, {
          status: 'payment_failed'
        });
      }
    }
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response('Erro ao processar webhook', { status: 500 });
  }
} 