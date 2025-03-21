import { Proposal } from '@/types/proposal';

class CheckoutService {
  private readonly MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

  async createPreference(proposal: Proposal) {
    try {
      console.log('Criando preferência de pagamento para proposta:', proposal.id);
      
      const response = await fetch('http://localhost:3000/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: proposal.id,
          title: `Proposta ${proposal.id}`,
          unit_price: proposal.value,
          quantity: 1,
          currency_id: 'BRL',
          description: proposal.description || 'Proposta de serviço'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar preferência: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Preferência criada:', data);
      return data;
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw error;
    }
  }

  async handlePayment(proposal: Proposal) {
    try {
      console.log('Iniciando processo de pagamento para proposta:', proposal.id);
      
      // Criar preferência de pagamento
      const preference = await this.createPreference(proposal);
      
      // Inicializar o Mercado Pago com a chave pública
      const mp = new window.MercadoPago(this.MP_PUBLIC_KEY);
      
      // Criar o botão de pagamento
      const bricksBuilder = mp.bricks();
      const renderCheckout = async (bricksBuilder: any) => {
        const settings = {
          initialization: {
            amount: proposal.value,
            preferenceId: preference.id
          },
          callbacks: {
            onReady: () => {
              console.log('Checkout pronto');
            },
            onSubmit: (data: any) => {
              console.log('Formulário enviado:', data);
            },
            onError: (error: any) => {
              console.error('Erro no checkout:', error);
            },
          },
        };

        window.checkoutBrickController = await bricksBuilder.create(
          'wallet',
          'checkout-btn',
          settings
        );
      };

      await renderCheckout(bricksBuilder);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService(); 