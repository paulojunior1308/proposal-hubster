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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'default', icon: Clock },
      sent: { label: 'Enviada', variant: 'outline', icon: Send },
      accepted: { label: 'Aceita', variant: 'secondary', icon: CheckCircle },
      rejected: { label: 'Rejeitada', variant: 'destructive', icon: XCircle },
      paid: { label: 'Paga', variant: 'success', icon: DollarSign },
      payment_pending: { label: 'Aguardando Pagamento', variant: 'warning', icon: Clock },
      payment_failed: { label: 'Pagamento Falhou', variant: 'destructive', icon: XCircle }
    }[status] || { label: status, variant: 'default', icon: Clock };

    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant as any}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;

    const statusConfig = {
      approved: { label: 'Pagamento Confirmado', variant: 'success' },
      pending: { label: 'Aguardando Pagamento', variant: 'warning' },
      rejected: { label: 'Pagamento Rejeitado', variant: 'destructive' },
      in_process: { label: 'Processando', variant: 'secondary' }
    }[paymentStatus] || { label: paymentStatus, variant: 'default' };

    return <Badge variant={statusConfig.variant as any}>{statusConfig.label}</Badge>;
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
              <TableCell>{getStatusBadge(proposal.status)}</TableCell>
              <TableCell>{getPaymentStatusBadge(proposal.paymentStatus)}</TableCell>
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
                    onClick={() => onEdit(proposal.id)}
                    title="Editar proposta"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(proposal.id)}
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