import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!
});

export const handler: Handler = async (event) => {
  // Habilitar CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Log das variáveis de ambiente
    console.log('Verificando variáveis de ambiente:', {
      hasAccessToken: !!process.env.MP_ACCESS_TOKEN,
      hasURL: !!process.env.URL
    });

    const { proposalId, title, price, description } = JSON.parse(event.body || '{}');

    console.log('Dados recebidos:', { proposalId, title, price, description });

    if (!proposalId || !title || !price) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Dados inválidos',
          details: 'proposalId, title e price são obrigatórios',
          received: { proposalId, title, price }
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

    console.log('Dados da preferência:', preferenceData);

    try {
      const response = await preference.create({ body: preferenceData });
      console.log('Resposta do Mercado Pago:', response);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferenceId: response.id,
          initPoint: response.init_point
        })
      };
    } catch (mpError) {
      console.error('Erro do Mercado Pago:', mpError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Erro ao criar preferência no Mercado Pago',
          details: mpError instanceof Error ? mpError.message : 'Erro na API do Mercado Pago'
        })
      };
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Erro ao criar preferência',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
    };
  }
}; 