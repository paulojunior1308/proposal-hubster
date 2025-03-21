import { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { proposalLinkService } from '@/services/proposalLinkService';

// Configurar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    // Verificar se é uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar informações do pagamento
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      const { external_reference, status } = paymentData;

      // Extrair IDs da referência externa
      const [proposalId, linkId] = external_reference.split('-');

      // Atualizar status do link da proposta
      if (status === 'approved') {
        await proposalLinkService.updateLinkStatus(linkId, 'paid', {
          paymentId: paymentId.toString(),
          paymentStatus: status
        });

        // Aqui você pode adicionar lógica adicional como:
        // - Criar um recebimento no sistema financeiro
        // - Enviar email de confirmação
        // - Atualizar status da proposta
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 