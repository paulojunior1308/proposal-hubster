import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  proposalClient: string;
}

export function DeleteProposalDialog({
  isOpen,
  onClose,
  onConfirm,
  proposalClient,
}: DeleteProposalDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Proposta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a proposta do cliente {proposalClient}?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 