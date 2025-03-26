import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Token do Mercado Pago:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN exists:', !!process.env.MP_ACCESS_TOKEN);

const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!
});

// Rota para criar preferência de pagamento
app.post('/api/create-payment', async (req, res) => {
  try {
    console.log('Recebida requisição para criar preferência:', req.body);
    const { proposalId, title, price, description } = req.body;

    if (!proposalId || !title || !price) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: 'proposalId, title e price são obrigatórios'
      });
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
        success: `${process.env.VITE_APP_URL}/proposta/${proposalId}/success`,
        failure: `${process.env.VITE_APP_URL}/proposta/${proposalId}/failure`,
        pending: `${process.env.VITE_APP_URL}/proposta/${proposalId}/pending`
      },
      auto_return: 'approved',
      external_reference: proposalId,
      notification_url: `${process.env.VITE_APP_URL}/api/webhooks/mercadopago`
    };

    console.log('Dados da preferência:', preferenceData);
    const response = await preference.create({ body: preferenceData });
    console.log('Resposta do Mercado Pago:', response);
    
    return res.status(200).json({
      preferenceId: response.id,
      initPoint: response.init_point
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return res.status(500).json({ 
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