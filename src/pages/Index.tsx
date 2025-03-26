import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Chart } from '@/components/dashboard/Chart';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, DashboardData } from '@/services/dashboardService';
import { toast } from 'sonner';
import { 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ProposalStatus } from '@/types/proposal';
import { ChartData } from '@/types/finance';

const Index = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboardData(user!.uid);
      setDashboardData(data);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      loadDashboardData();
    }
  }, [isLoading, loadDashboardData]);

  const getStatusIcon = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'declined':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusLabel = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return 'Aceita';
      case 'pending':
        return 'Pendente';
      case 'declined':
        return 'Recusada';
      default:
        return status;
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const chartData: ChartData[] = dashboardData.monthlyData.map(item => ({
    name: item.name,
    value: item.total,
    projetado: item.total * 1.1 // Exemplo de projeção
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do seu negócio</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total de Propostas" 
                value={dashboardData.totalProposals.toString()}
                icon="file"
                variant="primary"
                changeValue={0}
                changeText="total"
              />
              <MetricCard 
                title="Propostas Ativas" 
                value={dashboardData.activeProposals.toString()}
                icon="file"
                variant="success"
                changeValue={0}
                changeText="ativas"
              />
              <MetricCard 
                title="Faturamento Mensal" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(dashboardData.monthlyRevenue)}
                icon="money"
                variant="warning"
                changeValue={0}
                changeText="este mês"
              />
              <MetricCard 
                title="Recebimentos Pendentes" 
                value={dashboardData.pendingReceivables.toString()}
                icon="file"
                variant="danger"
                changeValue={0}
                changeText="pendentes"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle>Faturamento Mensal</CardTitle>
                  <CardDescription>Valores realizados por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Chart 
                      title=""
                      description=""
                      data={chartData}
                      type="bar" 
                      dataKeys={['value']}
                      colors={['#6A0572']}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Próximos Recebimentos</CardTitle>
                  <CardDescription>Últimos 5 recebimentos pendentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentReceivables.map((receivable) => (
                      <div key={receivable.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{receivable.client}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(receivable.value)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(receivable.dueDate, 'dd/MM/yyyy')}
                          </p>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                            receivable.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            receivable.status === 'overdue' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {receivable.status === 'pending' ? (
                              <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> Atrasado</>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Últimas Propostas</CardTitle>
                  <CardDescription>Propostas recentes do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentProposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{proposal.client}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(proposal.value)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(proposal.date), 'dd/MM/yyyy')}
                          </p>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                            {
                              "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400": proposal.status === 'accepted',
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400": proposal.status === 'pending',
                              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400": proposal.status === 'declined'
                            }
                          )}>
                            {getStatusIcon(proposal.status)}
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>Métricas financeiras do período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium">Faturamento Total</p>
                          <p className="text-sm text-muted-foreground">Valor total de propostas aprovadas</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(dashboardData.totalRevenue)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                        <div>
                          <p className="font-medium">Recebimentos Pendentes</p>
                          <p className="text-sm text-muted-foreground">Valores a receber</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-yellow-500">
                        {dashboardData.pendingReceivables}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <p className="font-medium">Recebimentos Atrasados</p>
                          <p className="text-sm text-muted-foreground">Valores em atraso</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-500">
                        {dashboardData.overdueReceivables}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
