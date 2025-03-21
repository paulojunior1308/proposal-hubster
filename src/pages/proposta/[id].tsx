import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { proposalLinkService, ProposalLink } from '@/services/proposalLinkService';
import { proposalService, Proposal } from '@/services/proposalService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago com a chave pública
initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!);

const PropostaPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [proposalLink, setProposalLink] = useState<ProposalLink | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const link = await proposalLinkService.getProposalLink(id as string);
      
      if (!link) {
        toast.error('Proposta não encontrada');
        return;
      }

      setProposalLink(link);
      
      // Verificar se o link expirou
      setIsExpired(new Date() > link.expiresAt);

      // Buscar dados da proposta
      const proposalData = await proposalService.getProposal(link.proposalId);
      setProposal(proposalData);

      // Se a proposta já foi aceita, criar preferência de pagamento
      if (link.status === 'accepted' && !link.paymentId) {
        const prefId = await proposalLinkService.createPaymentPreference(proposalData, link.id!);
        setPreferenceId(prefId);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!proposalLink?.id || !proposal) return;

    try {
      // Atualizar status para aceito
      await proposalLinkService.updateLinkStatus(proposalLink.id, 'accepted');
      
      // Criar preferência de pagamento
      const prefId = await proposalLinkService.createPaymentPreference(proposal, proposalLink.id);
      setPreferenceId(prefId);

      toast.success('Proposta aceita com sucesso!');
      loadProposal();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao aceitar proposta');
    }
  };

  const handleDecline = async () => {
    if (!proposalLink?.id) return;

    try {
      await proposalLinkService.updateLinkStatus(proposalLink.id, 'declined');
      toast.success('Proposta declinada');
      loadProposal();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao declinar proposta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!proposalLink || !proposal) {
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
    <div className="min-h-screen bg-background py-12 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Proposta para {proposal.client}</CardTitle>
              <CardDescription>
                Criada em {format(proposal.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <Badge variant={
              proposalLink.status === 'accepted' ? 'default' :
              proposalLink.status === 'declined' ? 'destructive' :
              proposalLink.status === 'paid' ? 'default' :
              isExpired ? 'destructive' : 'default'
            }>
              {proposalLink.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
              {proposalLink.status === 'declined' && <XCircle className="h-3 w-3 mr-1" />}
              {proposalLink.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {proposalLink.status === 'accepted' ? 'Aceita' :
               proposalLink.status === 'declined' ? 'Declinada' :
               proposalLink.status === 'paid' ? 'Paga' :
               isExpired ? 'Expirada' : 'Pendente'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">{proposal.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Detalhes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{proposal.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{proposal.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(proposal.value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Validade</p>
                <p className="font-medium">
                  {format(proposalLink.expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {proposalLink.status === 'pending' && !isExpired && (
            <div className="flex gap-4 justify-end w-full">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="w-32"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Declinar
              </Button>
              <Button
                onClick={handleAccept}
                className="w-32"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceitar
              </Button>
            </div>
          )}
          
          {proposalLink.status === 'accepted' && !proposalLink.paymentId && preferenceId && (
            <div className="w-full flex justify-center">
              <Wallet initialization={{ preferenceId }} />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PropostaPage; 