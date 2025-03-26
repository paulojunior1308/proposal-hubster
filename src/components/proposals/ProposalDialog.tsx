import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Proposal } from '@/types/proposal';
import { proposalService } from '@/services/proposalService';

interface ProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Proposal>) => void;
  proposal?: Proposal;
}

export const ProposalDialog = ({ isOpen, onClose, onSubmit, proposal }: ProposalDialogProps) => {
  const [formData, setFormData] = React.useState<Partial<Proposal>>({
    client: '',
    phone: '',
    value: 0,
    category: undefined,
    type: undefined,
    description: '',
    date: new Date(),
    ...proposal
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (field: keyof Proposal, value: Proposal[keyof Proposal]) => {
    setFormData((prev: Partial<Proposal>) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSendProposal = async () => {
    if (!proposal?.id) return;

    try {
      setIsLoading(true);
      await proposalService.sendProposalToClient(proposal);
      toast.success('Proposta enviada com sucesso!');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar proposta';
      console.error('Erro ao enviar proposta:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{proposal ? 'Editar Proposta' : 'Nova Proposta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={e => handleChange('client', e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="Ex: 5511999999999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={value => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sites">Sites</SelectItem>
                  <SelectItem value="Configuração e Manutenção">Configuração e Manutenção</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={value => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {formData.category === 'Sites' && (
                    <>
                      <SelectItem value="Landing Page">Landing Page</SelectItem>
                      <SelectItem value="Ecommerce">Ecommerce</SelectItem>
                      <SelectItem value="Sistema Web">Sistema Web</SelectItem>
                    </>
                  )}
                  {formData.category === 'Configuração e Manutenção' && (
                    <>
                      <SelectItem value="Manutenção de Sites">Manutenção de Sites</SelectItem>
                      <SelectItem value="Configuração de Servidores">Configuração de Servidores</SelectItem>
                      <SelectItem value="Backup e Segurança">Backup e Segurança</SelectItem>
                    </>
                  )}
                  {formData.category === 'Infraestrutura' && (
                    <>
                      <SelectItem value="Redes">Redes</SelectItem>
                      <SelectItem value="Servidores">Servidores</SelectItem>
                      <SelectItem value="Passagem de Cabos">Passagem de Cabos</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={e => handleChange('value', parseFloat(e.target.value))}
                placeholder="Valor da proposta"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd 'de' MMMM 'de' yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={date => date && handleChange('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Descreva os detalhes da proposta"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {proposal?.status === 'pending' && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSendProposal}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar para Cliente
              </Button>
            )}
            <Button type="submit">
              {proposal ? 'Salvar' : 'Criar'} Proposta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 