import { useState } from 'react';
import { Proposal } from '@/types/proposal';
import { Button } from '@/components/ui/button';
import { checkoutService } from '@/services/checkoutService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Interfaces para tipagem do Mercado Pago
interface MercadoPagoPreferenceOptions {
  initialization: {
    preferenceId: string;
  };
  customization?: {
    visual?: {
      hidePaymentButton?: boolean;
      backgroundColor?: string;
    };
  };
}

interface MercadoPagoBricksOptions {
  initialization: {
    preferenceId: string;
  };
}

interface MercadoPagoBricks {
  create: (
    type: 'wallet' | 'payment' | 'cardPayment',
    elementId: string,
    options: MercadoPagoBricksOptions
  ) => Promise<void>;
}

interface MercadoPagoInstance {
  checkout: {
    Preference: {
      createPreference(options: MercadoPagoPreferenceOptions): Promise<void>;
    };
  };
  bricks: () => MercadoPagoBricks;
}

declare global {
  interface Window {
    MercadoPago: {
      new (publicKey: string, options?: { locale: string }): MercadoPagoInstance;
    };
  }
}

interface ProposalDetailsProps {
  proposal: Proposal;
}

export const ProposalDetails = ({ proposal }: ProposalDetailsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const preference = await checkoutService.createPreference(proposal);
      
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
        locale: 'pt-BR'
      }) as MercadoPagoInstance;

      const bricksBuilder = mp.bricks();
      await bricksBuilder.create(
        'wallet',
        'checkout-button',
        {
          initialization: {
            preferenceId: preference.id
          }
        }
      );
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Detalhes da Proposta</h3>
        <p>Cliente: {proposal.client}</p>
        <p>Valor: R$ {proposal.value.toFixed(2)}</p>
        <p>Status: {proposal.status}</p>
        {proposal.description && <p>Descrição: {proposal.description}</p>}
      </div>

      {proposal.status === 'accepted' && (
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Realizar Pagamento'
            )}
          </Button>
          <div id="checkout-button" className="w-full" />
        </div>
      )}
    </div>
  );
}; 