import { Badge } from "@/components/ui/badge";

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

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  return (
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
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((proposal) => (
          <TableRow key={proposal.id}>
            <TableCell>{proposal.client}</TableCell>
            <TableCell>{proposal.category}</TableCell>
            <TableCell>{proposal.type}</TableCell>
            <TableCell>{format(proposal.createdAt.toDate(), "dd 'de' MMMM 'de' yyyy")}</TableCell>
            <TableCell>R$ {proposal.value.toFixed(2)}</TableCell>
            <TableCell>{getStatusBadge(proposal.status)}</TableCell>
            <TableCell>
              {proposal.paymentStatus && (
                <Badge 
                  variant={
                    proposal.paymentStatus === 'approved' ? 'success' : 
                    proposal.paymentStatus === 'pending' ? 'warning' : 
                    proposal.paymentStatus === 'rejected' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {proposal.paymentStatus === 'approved' ? 'Confirmado' :
                   proposal.paymentStatus === 'pending' ? 'Pendente' :
                   proposal.paymentStatus === 'rejected' ? 'Rejeitado' :
                   proposal.paymentStatus}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {/* ... ações existentes ... */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 