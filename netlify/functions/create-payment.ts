import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { proposalId, title, price, description } = JSON.parse(event.body || '{}');

    if (!proposalId || !title || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Dados inválidos',
          details: 'proposalId, title e price são obrigatórios'
        })
      };
    }

    const preference = new Preference(mercadopago);
    
    const preferenceData = {
      items: [
        {
          id: proposalId,
          title,
          unit_price: Number(price),
          quantity: 1,
          description: description || 'Sem descrição',
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${process.env.URL}/proposta/${proposalId}/success`,
        failure: `${process.env.URL}/proposta/${proposalId}/failure`,
        pending: `${process.env.URL}/proposta/${proposalId}/pending`
      },
      auto_return: 'approved',
      external_reference: proposalId,
      notification_url: `${process.env.URL}/api/webhooks/mercadopago`
    };

    const response = await preference.create({ body: preferenceData });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        preferenceId: response.id,
        initPoint: response.init_point
      })
    };
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erro ao criar preferência',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    };
  }
}; 