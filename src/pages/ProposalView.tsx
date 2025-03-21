import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Proposal } from '@/types/proposal';
import { proposalService } from '@/services/proposalService';
import { checkoutService } from '@/services/checkoutService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

declare const MercadoPago: any;

const ProposalView = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      console.log('Carregando proposta com ID:', id);
      loadProposal();
    } else {
      console.error('ID da proposta não fornecido na URL');
      setError('ID da proposta não fornecido');
    }
  }, [id]);

  const loadProposal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Iniciando carregamento da proposta...');
      const data = await proposalService.getProposal(id!);
      console.log('Proposta carregada:', data);
      console.log('Status da proposta:', data.status);
      setProposal(data);
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar proposta');
      toast.error('Erro ao carregar proposta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);
      console.log('Processando resposta:', accept ? 'aceitar' : 'recusar');
      await proposalService.updateProposal(id!, {
        status: accept ? 'accepted' : 'declined'
      });
      
      if (accept) {
        toast.success('Proposta aceita com sucesso!');
      } else {
        toast.info('Proposta recusada');
      }
      
      await loadProposal();
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

      console.log('Iniciando pagamento para proposta:', proposal.id);
      await checkoutService.handlePayment(proposal);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Proposta para {proposal.client}</CardTitle>
            <CardDescription>
              Revise os detalhes da proposta abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{proposal.description}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Status atual: {proposal.status}
            </div>

            {proposal.status === 'pending' && (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleResponse(true)}
                  disabled={isProcessing}
                  className="flex-1"
                  variant="default"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aceitar Proposta
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleResponse(false)}
                  disabled={isProcessing}
                  className="flex-1"
                  variant="destructive"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Recusar Proposta
                    </>
                  )}
                </Button>
              </div>
            )}

            {proposal.status === 'accepted' && (
              <div className="space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  variant="default"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Realizar Pagamento
                    </>
                  )}
                </Button>
                <div id="checkout-btn" className="w-full"></div>
              </div>
            )}

            {proposal.status === 'declined' && (
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Esta proposta foi recusada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalView; 