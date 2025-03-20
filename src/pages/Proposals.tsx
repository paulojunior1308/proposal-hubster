
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
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
  ArrowUpDown, 
  Clock,
  CheckCheck,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const proposals = [
  { id: 'P-2024-056', client: 'Empresa ABC', value: 'R$ 12.500,00', date: '12/05/2024', status: 'pending', type: 'Website' },
  { id: 'P-2024-055', client: 'StartUp XYZ', value: 'R$ 8.750,00', date: '10/05/2024', status: 'approved', type: 'E-commerce' },
  { id: 'P-2024-054', client: 'Consultoria 123', value: 'R$ 15.200,00', date: '08/05/2024', status: 'approved', type: 'Landing Page' },
  { id: 'P-2024-053', client: 'Tech Solutions', value: 'R$ 9.800,00', date: '05/05/2024', status: 'pending', type: 'Website' },
  { id: 'P-2024-052', client: 'Agência Digital', value: 'R$ 6.400,00', date: '01/05/2024', status: 'rejected', type: 'E-commerce' },
  { id: 'P-2024-051', client: 'Consultoria XPT', value: 'R$ 7.900,00', date: '29/04/2024', status: 'approved', type: 'Website' },
  { id: 'P-2024-050', client: 'Estúdio Design', value: 'R$ 5.200,00', date: '25/04/2024', status: 'rejected', type: 'Landing Page' },
  { id: 'P-2024-049', client: 'Loja Virtual', value: 'R$ 18.600,00', date: '22/04/2024', status: 'approved', type: 'E-commerce' },
  { id: 'P-2024-048', client: 'Escola Online', value: 'R$ 11.300,00', date: '20/04/2024', status: 'pending', type: 'Website' },
  { id: 'P-2024-047', client: 'Clínica Médica', value: 'R$ 8.900,00', date: '15/04/2024', status: 'approved', type: 'Website' },
];

const Proposals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proposal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesType = typeFilter === 'all' || proposal.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Propostas</h1>
                <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
              </div>
              <Button className="bg-hubster-secondary hover:bg-hubster-secondary/90">
                <Plus className="mr-2 h-4 w-4" /> Nova Proposta
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="approved">Aprovadas</TabsTrigger>
                  <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
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
                        <p className="text-sm font-medium">Filtrar por Tipo</p>
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Landing Page">Landing Page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                              Cliente
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                              Data
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredProposals.map((proposal) => (
                          <tr key={proposal.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{proposal.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{proposal.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{proposal.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{proposal.value}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {proposal.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                                proposal.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                proposal.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                                proposal.status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                                {proposal.status === 'approved' ? (
                                  <><CheckCheck className="h-3 w-3 mr-1" /> Aprovada</>
                                ) : proposal.status === 'pending' ? (
                                  <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                                ) : (
                                  <><XCircle className="h-3 w-3 mr-1" /> Rejeitada</>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon">
                                  <FileDown className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredProposals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <p className="text-lg font-medium">Nenhuma proposta encontrada</p>
                      <p className="text-muted-foreground mt-1">Tente ajustar seus filtros ou criar uma nova proposta</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                {/* Similar content but filtered for pending */}
                <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
                  {/* Table would go here with filtered content */}
                  <p className="p-8 text-center text-muted-foreground">Visualização de propostas pendentes</p>
                </div>
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                {/* Similar content but filtered for approved */}
                <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
                  {/* Table would go here with filtered content */}
                  <p className="p-8 text-center text-muted-foreground">Visualização de propostas aprovadas</p>
                </div>
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                {/* Similar content but filtered for rejected */}
                <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
                  {/* Table would go here with filtered content */}
                  <p className="p-8 text-center text-muted-foreground">Visualização de propostas rejeitadas</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Proposals;
