import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder ao preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Webhook recebido:', event.body);
    const { type, data } = JSON.parse(event.body || '{}');

    // Verificar se é uma notificação de pagamento
    if (type === 'payment') {
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN!
      });

      const payment = new Payment(mercadopago);
      const paymentData = await payment.get({ id: data.id });

      console.log('Dados do pagamento:', paymentData);

      if (paymentData.status === 'approved') {
        // Atualizar status da proposta no Firestore
        const proposalRef = doc(db, 'proposals', paymentData.external_reference);
        await updateDoc(proposalRef, {
          status: 'paid',
          paymentId: paymentData.id,
          paymentDate: new Date(),
          paymentStatus: paymentData.status
        });

        console.log('Proposta atualizada com sucesso:', paymentData.external_reference);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Webhook processado com sucesso' })
    };

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao processar webhook',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    };
  }
}; 