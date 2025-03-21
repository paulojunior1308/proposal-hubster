import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  FileDown, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProposalForm } from '@/components/proposals/ProposalForm';
import { DeleteProposalDialog } from '@/components/proposals/DeleteProposalDialog';
import { proposalService, Proposal, proposalCategories, ProposalType, ProposalStatus } from '@/services/proposalService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as z from 'zod';
import { StatusDropdown } from '@/components/proposals/StatusDropdown';
import { ProposalsTable } from '@/components/proposals/ProposalsTable';

const proposalSchema = z.object({
  client: z.string().min(1, 'Nome do cliente é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  value: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.enum(['Sites', 'Configuração e Manutenção', 'Infraestrutura'], {
    required_error: 'Categoria é obrigatória',
  }),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

const Proposals = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await proposalService.getProposals(user.uid);
      setProposals(data);
    } catch (error) {
      toast.error('Erro ao carregar propostas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = async (data: ProposalFormData) => {
    if (!user) return;

    try {
      const newProposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        client: data.client,
        phone: data.phone,
        value: parseFloat(data.value),
        date: new Date(data.date),
        category: data.category,
        type: data.type as ProposalType,
        description: data.description,
        userId: user.uid
      };

      await proposalService.createProposal(newProposal);
      toast.success('Proposta criada com sucesso!');
      setIsFormOpen(false);
      loadProposals();
    } catch (error) {
      toast.error('Erro ao criar proposta');
      console.error(error);
    }
  };

  const handleUpdateProposal = async (data: ProposalFormData) => {
    if (!selectedProposal?.id) return;

    try {
      await proposalService.updateProposal(selectedProposal.id, {
        client: data.client,
        value: parseFloat(data.value),
        date: new Date(data.date),
        category: data.category,
        type: data.type as ProposalType,
        description: data.description
      });
      toast.success('Proposta atualizada com sucesso!');
      setIsFormOpen(false);
      setSelectedProposal(null);
      loadProposals();
    } catch (error) {
      toast.error('Erro ao atualizar proposta');
      console.error(error);
    }
  };

  const handleDeleteProposal = async () => {
    if (!selectedProposal?.id) return;

    try {
      await proposalService.deleteProposal(selectedProposal.id);
      toast.success('Proposta excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedProposal(null);
      loadProposals();
    } catch (error) {
      toast.error('Erro ao excluir proposta');
      console.error(error);
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: ProposalStatus) => {
    try {
      await proposalService.updateProposal(proposalId, { status: newStatus });
      toast.success('Status da proposta atualizado com sucesso!');
      loadProposals();
    } catch (error) {
      toast.error('Erro ao atualizar status da proposta');
      console.error(error);
    }
  };

  const handleDownloadProposal = (proposal: Proposal) => {
    try {
      proposalService.generateProposalPDF(proposal);
      toast.success('Proposta baixada com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar proposta');
      console.error(error);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || proposal.category === categoryFilter;
    const matchesType = typeFilter === 'all' || proposal.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const handleEditClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDeleteDialogOpen(true);
  };

  const handleNewProposalClick = () => {
    setSelectedProposal(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Propostas</h1>
                <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
              </div>
              <Button 
                className="bg-hubster-secondary hover:bg-hubster-secondary/90"
                onClick={handleNewProposalClick}
              >
                <Plus className="mr-2 h-4 w-4" /> Nova Proposta
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="w-full space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="waiting_client">Aguardando Cliente</TabsTrigger>
                  <TabsTrigger value="accepted">Aceitas</TabsTrigger>
                  <TabsTrigger value="declined">Recusadas</TabsTrigger>
                  <TabsTrigger value="paid">Pagas</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-1 sm:max-w-md gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar propostas..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2 space-y-2">
                        <p className="text-sm font-medium">Filtrar por Categoria</p>
                        <Select
                          value={categoryFilter}
                          onValueChange={setCategoryFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {Object.keys(proposalCategories).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
              <TabsContent value="pending" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals.filter(p => p.status === 'pending')}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
              <TabsContent value="waiting_client" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals.filter(p => p.status === 'waiting_client')}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
              <TabsContent value="accepted" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals.filter(p => p.status === 'accepted')}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
              <TabsContent value="declined" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals.filter(p => p.status === 'declined')}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
              <TabsContent value="paid" className="space-y-4">
                <ProposalsTable
                  proposals={filteredProposals.filter(p => p.status === 'paid')}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProposal ? 'Editar Proposta' : 'Nova Proposta'}
            </DialogTitle>
          </DialogHeader>
          <ProposalForm
            proposal={selectedProposal || undefined}
            onSubmit={selectedProposal ? handleUpdateProposal : handleCreateProposal}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedProposal(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <DeleteProposalDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProposal(null);
        }}
        onConfirm={handleDeleteProposal}
        proposalClient={selectedProposal?.client || ''}
      />
    </div>
  );
};

export default Proposals;
