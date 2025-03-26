import { useRouter } from 'next/router';
import { proposalService } from '@/services/proposalService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Proposal } from '@/types/proposal';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

// Inicializar Mercado Pago com a chave pública
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

const PropostaPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [preferenceId, setPreferenceId] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  useEffect(() => {
    if (proposal) {
      console.log('Status atual da proposta:', proposal.status);
    }
  }, [proposal]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const proposalData = await proposalService.getProposal(id as string);
      
      if (!proposalData) {
        toast.error('Proposta não encontrada');
        return;
      }

      setProposal(proposalData);
      
      if (proposalData.status === 'accepted' && !proposalData.paymentId) {
        const result = await proposalService.createPaymentPreference(proposalData);
        setPreferenceId(result.preferenceId);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (accept: boolean) => {
    if (!proposal?.id) return;

    try {
      await proposalService.handleProposalResponse(proposal.id, accept);
      
      if (accept) {
        toast.success('Proposta aceita! Redirecionando para pagamento...');
        const { preferenceId } = await proposalService.createPaymentPreference(proposal);
        setPreferenceId(preferenceId);
      } else {
        toast.info('Proposta recusada');
      }
      
      loadProposal();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar resposta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              Proposta não encontrada
            </CardTitle>
            <CardDescription className="text-center">
              O link da proposta é inválido ou expirou.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : proposal ? (
        <Card>
          <CardHeader>
            <CardTitle>Proposta para {proposal.client}</CardTitle>
            <CardDescription>
              Criada em {format(proposal.createdAt.toDate(), 'dd/MM/yyyy')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor</Label>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(proposal.value)}
                  </p>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <p className="text-lg">{proposal.category}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="text-lg">{proposal.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-lg capitalize">{proposal.status}</p>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="text-gray-600">{proposal.description}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {proposal.status === 'waiting_client' && (
              <div className="flex gap-4 w-full">
                <Button
                  onClick={() => handleResponse(false)}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Recusar Proposta
                </Button>
                <Button
                  onClick={() => handleResponse(true)}
                  variant="default"
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aceitar Proposta
                </Button>
              </div>
            )}
            
            {proposal.status === 'accepted' && !proposal.paymentId && preferenceId && (
              <div className="w-full">
                <Wallet initialization={{ preferenceId }} />
              </div>
            )}

            {proposal.status === 'declined' && (
              <div className="bg-destructive/10 p-4 rounded-lg w-full">
                <p className="text-sm text-destructive text-center font-medium">
                  Esta proposta foi recusada
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold">Proposta não encontrada</h2>
        </div>
      )}
    </div>
  );
};

export default PropostaPage; 