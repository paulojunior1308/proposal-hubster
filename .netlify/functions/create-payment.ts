import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const handler: Handler = async (event) => {
  // Adicionar headers CORS em todas as respostas
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar token do Mercado Pago
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('MP_ACCESS_TOKEN não configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Configuração inválida',
          details: 'Token do Mercado Pago não configurado'
        })
      };
    }

    const mercadopago = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const { proposalId, title, price, description } = JSON.parse(event.body || '{}');

    console.log('Dados recebidos:', { proposalId, title, price, description });

    // Validar dados obrigatórios
    if (!proposalId || !title || !price) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Dados inválidos',
          details: 'proposalId, title e price são obrigatórios',
          received: { proposalId, title, price }
        })
      };
    }

    const preference = new Preference(mercadopago);
    
    const baseURL = process.env.URL || 'https://orc-jrtech.netlify.app';
    
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
        success: `${baseURL}/proposta/${proposalId}/success`,
        failure: `${baseURL}/proposta/${proposalId}/failure`,
        pending: `${baseURL}/proposta/${proposalId}/pending`
      },
      auto_return: 'approved',
      external_reference: proposalId,
      notification_url: `${baseURL}/.netlify/functions/webhook-mercadopago`,
      statement_descriptor: 'JR TECH',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Criando preferência com dados:', preferenceData);

    const response = await preference.create({ body: preferenceData });
    console.log('Resposta do Mercado Pago:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        preferenceId: response.id,
        initPoint: response.init_point
      })
    };

  } catch (error) {
    console.error('Erro detalhado:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao criar preferência no Mercado Pago',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
    };
  }
}; 