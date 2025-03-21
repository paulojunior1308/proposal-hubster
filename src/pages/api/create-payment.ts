import { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { proposalId, linkId, title, price, description } = req.body;

    // Criar preferência de pagamento
    const preference = new Preference(client);
    const preferenceData = {
      items: [
        {
          id: proposalId,
          title,
          unit_price: Number(price),
          quantity: 1,
          description,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/proposta/${linkId}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/proposta/${linkId}/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/proposta/${linkId}/pending`
      },
      auto_return: 'approved',
      external_reference: `${proposalId}-${linkId}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`
    };

    const response = await preference.create({ body: preferenceData });
    
    return res.status(200).json({
      preferenceId: response.id
    });
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 