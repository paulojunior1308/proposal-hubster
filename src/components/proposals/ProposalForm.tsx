import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Proposal, ProposalCategory, proposalCategories } from '@/services/proposalService';

const proposalSchema = z.object({
  client: z.string().min(1, 'Nome do cliente é obrigatório'),
  value: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.enum(['Sites', 'Configuração e Manutenção', 'Infraestrutura'], {
    required_error: 'Categoria é obrigatória',
  }),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
  phone: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  proposal?: Proposal;
  onSubmit: (data: ProposalFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProposalForm({ proposal, onSubmit, onCancel }: ProposalFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: proposal
      ? {
          client: proposal.client,
          value: proposal.value.toString(),
          date: proposal.date.toISOString().split('T')[0],
          category: proposal.category,
          type: proposal.type,
          description: proposal.description,
          phone: proposal.phone,
        }
      : undefined,
  });

  const selectedCategory = watch('category');

  const handleCategoryChange = (category: ProposalCategory) => {
    setValue('category', category);
    setValue('type', ''); // Limpa o tipo quando a categoria muda
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="client">Nome do Cliente</Label>
          <Input
            id="client"
            {...register('client')}
            placeholder="Digite o nome do cliente"
          />
          {errors.client && (
            <p className="text-sm text-red-500">{errors.client.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(00) 00000-0000"
            defaultValue={proposal?.phone || ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            {...register('value')}
            placeholder="0,00"
          />
          {errors.value && (
            <p className="text-sm text-red-500">{errors.value.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            onValueChange={(value) => setValue('category', value as ProposalCategory)}
            defaultValue={proposal?.category || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(proposalCategories).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select 
            value={watch('type')} 
            onValueChange={(value) => setValue('type', value)}
            disabled={!selectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory && proposalCategories[selectedCategory].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descrição da proposta"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : proposal ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
} 