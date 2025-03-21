import { MercadoPagoConfig, Preference } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({ 
  accessToken: import.meta.env.VITE_MP_ACCESS_TOKEN!
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const body = await req.json();
    const preference = new Preference(mercadopago);
    
    const preferenceData = {
      items: [
        {
          id: body.id,
          title: body.title,
          unit_price: body.unit_price,
          quantity: body.quantity,
          currency_id: body.currency_id,
          description: body.description
        }
      ],
      back_urls: {
        success: `${window.location.origin}/proposals`,
        failure: `${window.location.origin}/proposals`,
        pending: `${window.location.origin}/proposals`
      },
      auto_return: 'approved',
      external_reference: body.id,
      notification_url: `${window.location.origin}/api/webhooks/mercadopago`
    };

    const response = await preference.create({ body: preferenceData });
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return new Response('Erro ao criar preferência', { status: 500 });
  }
} 