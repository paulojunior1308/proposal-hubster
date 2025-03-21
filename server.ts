import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Token do Mercado Pago:', process.env.MP_ACCESS_TOKEN);

const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!
});

// Rota para criar preferência de pagamento
app.post('/api/create-preference', async (req, res) => {
  try {
    console.log('Recebida requisição para criar preferência:', req.body);
    const preference = new Preference(mercadopago);
    
    const preferenceData = {
      items: [
        {
          id: req.body.id,
          title: req.body.title,
          unit_price: req.body.unit_price,
          quantity: req.body.quantity,
          currency_id: req.body.currency_id,
          description: req.body.description
        }
      ],
      back_urls: {
        success: `${req.headers.origin}/proposals`,
        failure: `${req.headers.origin}/proposals`,
        pending: `${req.headers.origin}/proposals`
      },
      auto_return: 'approved',
      external_reference: req.body.id,
      notification_url: `${req.headers.origin}/api/webhooks/mercadopago`
    };

    console.log('Dados da preferência:', preferenceData);
    const response = await preference.create({ body: preferenceData });
    console.log('Resposta do Mercado Pago:', response);
    res.json(response);
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ 
      error: 'Erro ao criar preferência',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para webhook do Mercado Pago
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook recebido:', body);
    
    // Verifica se é uma notificação de pagamento
    if (body.type === 'payment') {
      const payment = body.data;
      console.log('Pagamento recebido:', payment);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ 
      error: 'Erro ao processar webhook',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 