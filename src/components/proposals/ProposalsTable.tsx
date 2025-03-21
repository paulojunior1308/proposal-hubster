import React from 'react';
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
import { Proposal, proposalService } from '@/services/proposalService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Send, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalsTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
}

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

type StatusConfig = {
  [K in Proposal['status']]: {
    label: string;
    variant: BadgeVariant;
    icon: React.ElementType;
  }
};

export const ProposalsTable = ({ proposals, onEdit, onDelete }: ProposalsTableProps) => {
  const handleSendProposal = async (proposal: Proposal) => {
    try {
      const url = await proposalService.sendProposalToClient(proposal);
      toast.success('Proposta enviada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar proposta');
    }
  };

  const getStatusBadge = (status: Proposal['status']) => {
    const statusConfig: StatusConfig = {
      pending: { label: 'Pendente', variant: 'default', icon: Clock },
      waiting_client: { label: 'Aguardando Cliente', variant: 'outline', icon: Send },
      accepted: { label: 'Aceita', variant: 'secondary', icon: CheckCircle },
      declined: { label: 'Declinada', variant: 'destructive', icon: XCircle },
      paid: { label: 'Paga', variant: 'secondary', icon: DollarSign }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
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
                {format(proposal.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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