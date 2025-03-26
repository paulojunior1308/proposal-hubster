import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// ... outros imports ...

const getStatusBadge = (status: string, paymentStatus?: string) => {
  switch (status) {
    case 'accepted':
      return <Badge variant="secondary">Aceita</Badge>;
    case 'paid':
      return <Badge variant="success">Pago</Badge>;
    case 'payment_pending':
      return <Badge variant="warning">Aguardando Pagamento</Badge>;
    case 'payment_failed':
      return <Badge variant="destructive">Pagamento Falhou</Badge>;
    case 'sent':
      return <Badge variant="default">Aguardando Cliente</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (paymentStatus?: string) => {
  if (!paymentStatus) return null;

  switch (paymentStatus) {
    case 'approved':
      return <Badge variant="success">Pagamento Confirmado</Badge>;
    case 'pending':
      return <Badge variant="warning">Pagamento Pendente</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Pagamento Rejeitado</Badge>;
    default:
      return <Badge variant="secondary">{paymentStatus}</Badge>;
  }
};

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  return (
    <div className="overflow-x-auto">
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
                <Badge variant={
                  proposal.status === 'paid' ? 'success' :
                  proposal.status === 'accepted' ? 'default' :
                  proposal.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {proposal.status}
                </Badge>
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(proposal.paymentStatus)}
              </TableCell>
              <TableCell className="text-right">
                {/* ... ações existentes ... */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 