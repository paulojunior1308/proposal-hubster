
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Chart } from '@/components/dashboard/Chart';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight, FileDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const revenueData = [
  { name: 'Jan', value: 12000 },
  { name: 'Fev', value: 9000 },
  { name: 'Mar', value: 15000 },
  { name: 'Abr', value: 10000 },
  { name: 'Mai', value: 18000 },
  { name: 'Jun', value: 14000 },
  { name: 'Jul', value: 20000 },
  { name: 'Ago', value: 22000 },
  { name: 'Set', value: 17000 },
  { name: 'Out', value: 19000 },
  { name: 'Nov', value: 21000 },
  { name: 'Dez', value: 25000 },
];

const proposalsData = [
  { name: 'Jan', enviadas: 8, fechadas: 5 },
  { name: 'Fev', enviadas: 6, fechadas: 4 },
  { name: 'Mar', enviadas: 10, fechadas: 7 },
  { name: 'Abr', enviadas: 9, fechadas: 6 },
  { name: 'Mai', enviadas: 12, fechadas: 9 },
  { name: 'Jun', enviadas: 8, fechadas: 6 },
];

const recentProposals = [
  { id: 'P-2024-056', client: 'Empresa ABC', value: 'R$ 12.500,00', date: '12/05/2024', status: 'pending' },
  { id: 'P-2024-055', client: 'StartUp XYZ', value: 'R$ 8.750,00', date: '10/05/2024', status: 'approved' },
  { id: 'P-2024-054', client: 'Consultoria 123', value: 'R$ 15.200,00', date: '08/05/2024', status: 'approved' },
  { id: 'P-2024-053', client: 'Tech Solutions', value: 'R$ 9.800,00', date: '05/05/2024', status: 'pending' },
  { id: 'P-2024-052', client: 'Agência Digital', value: 'R$ 6.400,00', date: '01/05/2024', status: 'rejected' },
];

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div className="flex flex-col mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do seu negócio</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Faturamento Mensal" 
                value="R$ 22.500,00" 
                icon="money"
                variant="primary"
                changeValue={12}
                changeText="vs. mês anterior"
              />
              <MetricCard 
                title="Propostas Enviadas" 
                value="8" 
                icon="file"
                variant="default"
                changeValue={-3}
                changeText="vs. mês anterior"
              />
              <MetricCard 
                title="Taxa de Conversão" 
                value="68%" 
                icon="chart"
                variant="success"
                changeValue={4}
                changeText="vs. mês anterior"
              />
              <MetricCard 
                title="Ticket Médio" 
                value="R$ 12.800,00" 
                icon="money"
                variant="warning"
                changeValue={0}
                changeText="sem alteração"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Chart 
                title="Faturamento Anual" 
                description="Visualização do faturamento mensal durante o ano"
                data={revenueData} 
                type="bar" 
                dataKeys={['value']}
                colors={['#0077B6']}
              />
              <Chart 
                title="Propostas" 
                description="Relação entre propostas enviadas e fechadas"
                data={proposalsData} 
                type="line" 
                dataKeys={['enviadas', 'fechadas']}
                colors={['#6A0572', '#0077B6']}
              />
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 flex justify-between items-center border-b border-border">
                <h2 className="font-semibold">Propostas Recentes</h2>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/proposals">
                    Ver Todas <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentProposals.map((proposal) => (
                      <tr key={proposal.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{proposal.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{proposal.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{proposal.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {proposal.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                            proposal.status === 'approved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                            proposal.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            proposal.status === 'rejected' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {proposal.status === 'approved' ? 'Aprovada' : 
                             proposal.status === 'pending' ? 'Pendente' : 'Rejeitada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            <FileDown className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
