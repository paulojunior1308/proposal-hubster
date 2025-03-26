import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Proposal, ProposalStatus } from '@/types/proposal';
import { proposalService } from '@/services/proposalService';
import { format } from 'date-fns';
import { Edit, Trash2, Send, CheckCircle, XCircle, Clock, DollarSign, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalsTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface StatusConfig {
  [key: string]: {
    label: string;
    variant: BadgeVariant;
    icon: any;
  }
}

export const ProposalsTable = ({ proposals, onEdit, onDelete }: ProposalsTableProps) => {
  const handleSendProposal = async (proposal: Proposal) => {
    try {
      await proposalService.sendProposalToClient(proposal);
      toast.success('Proposta enviada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar proposta');
    }
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    const statusConfig: StatusConfig = {
      draft: { label: 'Rascunho', variant: 'default', icon: Clock },
      sent: { label: 'Enviada', variant: 'outline', icon: Send },
      accepted: { label: 'Aceita', variant: 'secondary', icon: CheckCircle },
      rejected: { label: 'Rejeitada', variant: 'destructive', icon: XCircle },
      paid: { label: 'Paga', variant: 'success', icon: DollarSign },
      payment_pending: { label: 'Aguardando Pagamento', variant: 'warning', icon: Clock },
      payment_failed: { label: 'Pagamento Falhou', variant: 'destructive', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;

    const statusConfig = {
      approved: { label: 'Pagamento Confirmado', variant: 'success' as const },
      pending: { label: 'Aguardando Pagamento', variant: 'warning' as const },
      rejected: { label: 'Pagamento Rejeitado', variant: 'destructive' as const },
      in_process: { label: 'Processando', variant: 'secondary' as const }
    };

    const config = statusConfig[paymentStatus] || { label: paymentStatus, variant: 'default' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell>{proposal.client}</TableCell>
              <TableCell>{proposal.category}</TableCell>
              <TableCell>{proposal.type}</TableCell>
              <TableCell>
                {format(proposal.createdAt.toDate(), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(proposal.value)}
              </TableCell>
              <TableCell>
                {getStatusBadge(proposal.status)}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(proposal.paymentStatus)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {proposal.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendProposal(proposal)}
                      title="Enviar proposta"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(proposal)}
                    title="Editar proposta"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(proposal)}
                    title="Excluir proposta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 