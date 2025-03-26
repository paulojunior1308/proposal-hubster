import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Proposal } from '@/types/proposal';
import { proposalService } from '@/services/proposalService';
import { checkoutService } from '@/services/checkoutService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CardFooter } from '@/components/ui/card';
import { initMercadoPago } from '@mercadopago/sdk-react';

// Inicializar o Mercado Pago
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

const ProposalView = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProposal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Iniciando carregamento da proposta...');
      const data = await proposalService.getProposal(id!);
      console.log('Proposta carregada:', data);
      console.log('Status da proposta:', data?.status);
      setProposal(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar proposta';
      console.error('Erro ao carregar proposta:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log('Carregando proposta com ID:', id);
      loadProposal();
    } else {
      console.error('ID da proposta não fornecido na URL');
      setError('ID da proposta não fornecido');
    }
  }, [id, loadProposal]);

  const handleResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);
      console.log('Processando resposta:', accept ? 'aceitar' : 'recusar');
      await proposalService.handleProposalResponse(id!, accept);
      await loadProposal();
      toast.success(accept ? 'Proposta aceita!' : 'Proposta recusada');
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      toast.error('Erro ao processar resposta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    try {
      if (!proposal) {
        throw new Error('Proposta não encontrada');
      }

      setIsProcessing(true);
      console.log('Iniciando pagamento para proposta:', proposal.id);
      await checkoutService.handlePayment(proposal);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar proposta</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">ID da proposta: {id}</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proposta não encontrada</h1>
          <p className="text-muted-foreground">A proposta que você está procurando não existe ou foi removida.</p>
          <p className="text-sm text-muted-foreground mt-2">ID da proposta: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Proposta para {proposal.client}</CardTitle>
          <CardDescription>
            Criada em {format(proposal.createdAt.toDate(), 'dd/MM/yyyy')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Valor:</h3>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(proposal.value)}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Descrição:</h3>
            <p>{proposal.description || 'Sem descrição'}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {proposal.status === 'waiting_client' && (
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => handleResponse(false)}
                variant="destructive"
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Recusar'}
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Aceitar'}
              </Button>
            </div>
          )}

          {proposal.status === 'accepted' && (
            <div className="w-full">
              <Button
                onClick={handlePayment}
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  'Realizar Pagamento'
                )}
              </Button>
              <div id="checkout-button" className="mt-4" />
            </div>
          )}

          {proposal.status === 'declined' && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Esta proposta foi recusada.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProposalView; 