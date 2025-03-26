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
    const { action, data } = JSON.parse(event.body || '{}');

    if (action === 'payment.created' || action === 'payment.updated') {
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN!
      });

      const payment = new Payment(mercadopago);
      const paymentData = await payment.get({ id: data.id });

      console.log('Dados do pagamento:', paymentData);

      const proposalRef = doc(db, 'proposals', paymentData.external_reference);

      // Atualizar a proposta com os dados do pagamento
      await updateDoc(proposalRef, {
        paymentId: paymentData.id,
        paymentStatus: paymentData.status,
        paymentStatusDetail: paymentData.status_detail,
        paymentDate: new Date(),
        status: paymentData.status === 'approved' ? 'paid' : 
               paymentData.status === 'pending' ? 'payment_pending' : 
               paymentData.status === 'rejected' ? 'payment_failed' : 
               'payment_processing'
      });

      console.log('Proposta atualizada:', {
        id: paymentData.external_reference,
        status: paymentData.status
      });
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