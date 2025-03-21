import { useState } from 'react';
import { Proposal } from '@/services/proposalService';
import { Button } from '@/components/ui/button';
import { checkoutService } from '@/services/checkoutService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

declare const MercadoPago: any;

interface ProposalDetailsProps {
  proposal: Proposal;
}

export const ProposalDetails = ({ proposal }: ProposalDetailsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const preference = await checkoutService.createPreference(proposal);
      
      // Inicializa o Mercado Pago
      const mp = new MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
        locale: 'pt-BR'
      });

      // Cria o botão de checkout
      mp.checkout({
        preference: {
          id: preference.id
        },
        render: {
          container: '.checkout-button',
          label: 'Pagar com Mercado Pago',
        }
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Cliente</h3>
          <p className="text-lg font-semibold">{proposal.client}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Valor</h3>
          <p className="text-lg font-semibold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(proposal.value)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
          <p className="text-lg font-semibold">
            {new Date(proposal.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="text-lg font-semibold capitalize">{proposal.status}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
        <p className="text-sm">{proposal.description}</p>
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
              'Pagar Proposta'
            )}
          </Button>
          <div className="checkout-button"></div>
        </div>
      )}
    </div>
  );
}; 