import { Proposal } from '@/types/proposal';

export class CheckoutService {
  private readonly MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

  constructor() {
    if (!this.MP_PUBLIC_KEY) {
      console.error('MP_PUBLIC_KEY não definida');
    }
  }

  async createPreference(proposal: Proposal) {
    try {
      console.log('Criando preferência de pagamento para proposta:', {
        id: proposal.id,
        client: proposal.client,
        value: proposal.value
      });
      
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          title: `Proposta - ${proposal.client}`,
          price: proposal.value,
          description: proposal.description || 'Pagamento de proposta'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Resposta de erro:', data);
        throw new Error(data.details || 'Erro ao criar preferência de pagamento');
      }

      console.log('Preferência criada:', data);
      return data;
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw error;
    }
  }

  async handlePayment(proposal: Proposal) {
    try {
      const { preferenceId } = await this.createPreference(proposal);
      
      // Inicializar o Mercado Pago
      const mp = new window.MercadoPago(this.MP_PUBLIC_KEY, {
        locale: 'pt-BR'
      });

      // Criar o botão de pagamento
      const bricksBuilder = mp.bricks();
      await bricksBuilder.create(
        'wallet',
        'checkout-button',
        {
          initialization: {
            preferenceId
          }
        }
      );
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService(); 