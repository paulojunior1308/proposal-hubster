import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Chart } from '@/components/dashboard/Chart';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceData, Receivable, financeService } from '@/services/financeService';
import { toast } from 'sonner';
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CircleDollarSign,
  BadgePercent,
  ArrowUpDown,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { format } from 'date-fns';

const Finance = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, year]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [financeResult, receivablesResult] = await Promise.all([
        financeService.getFinanceData(user!.uid, year),
        financeService.getReceivables(user!.uid)
      ]);
      setFinanceData(financeResult);
      setReceivables(receivablesResult);
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReceivableStatus = async (id: string, status: 'paid' | 'pending' | 'overdue') => {
    try {
      await financeService.updateReceivable(id, { status });
      toast.success('Status atualizado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    }
  };

  const handleDeleteReceivable = async () => {
    if (!selectedReceivable?.id) return;

    try {
      await financeService.deleteReceivable(selectedReceivable.id);
      toast.success('Recebimento excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedReceivable(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir recebimento');
      console.error(error);
    }
  };

  const metrics = financeService.calculateMetrics(financeData);
  const chartData = financeData.map(data => ({
    name: data.month,
    value: data.value,
    projetado: data.projectedValue
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Financeiro</h1>
                <p className="text-muted-foreground">Gestão de faturamento e recebimentos</p>
              </div>
              <div className="flex gap-3">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Faturamento Anual" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(metrics.total)}
                icon="money"
                variant="primary"
                changeValue={Math.round(metrics.growth)}
                changeText="vs. projetado"
              />
              <MetricCard 
                title="Faturamento Mensal" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(metrics.currentMonth)}
                icon="chart"
                variant="success"
                changeValue={Math.round(metrics.monthlyGrowth)}
                changeText="vs. mês anterior"
              />
              <MetricCard 
                title="Média Mensal" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(metrics.average)}
                icon="calendar"
                variant="default"
                changeValue={0}
                changeText="média do período"
              />
              <MetricCard 
                title="Previsão Anual" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(metrics.projected)}
                icon="money"
                variant="warning"
                changeValue={Math.round((metrics.projected / metrics.total - 1) * 100)}
                changeText="crescimento"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle>Faturamento Anual</CardTitle>
                  <CardDescription>Valores realizados x projetados ({year})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Chart 
                      title=""
                      description=""
                      data={chartData}
                      type="bar" 
                      dataKeys={['value', 'projetado']}
                      colors={['#6A0572', '#0077B6']}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle>Indicadores Financeiros</CardTitle>
                  <CardDescription>Métricas atuais do negócio</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-hubster-primary/10 mr-3">
                          <CircleDollarSign className="h-5 w-5 text-hubster-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ticket Médio</p>
                          <p className="text-xs text-muted-foreground">Valor médio das propostas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(metrics.average)}
                        </p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> Média atual
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-hubster-secondary/10 mr-3">
                          <BadgePercent className="h-5 w-5 text-hubster-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Crescimento</p>
                          <p className="text-xs text-muted-foreground">Variação mensal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{Math.round(metrics.monthlyGrowth)}%</p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> vs. mês anterior
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-amber-500/10 mr-3">
                          <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Mês Atual</p>
                          <p className="text-xs text-muted-foreground">Faturamento</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(metrics.currentMonth)}
                        </p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> Mês corrente
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-500/10 mr-3">
                          <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Projeção</p>
                          <p className="text-xs text-muted-foreground">Próximo mês</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(metrics.projected / 12)} {/* Média mensal projetada */}
                        </p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> Estimativa
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 flex justify-between items-center border-b border-border">
                <h2 className="font-semibold">Próximos Recebimentos</h2>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> Filtrar
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center">
                          Valor
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center">
                          Vencimento
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
                          </div>
                        </td>
                      </tr>
                    ) : receivables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                          Nenhum recebimento encontrado
                        </td>
                      </tr>
                    ) : (
                      receivables.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.id?.slice(-6)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{item.client}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(item.dueDate, 'dd/MM/yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                              item.status === 'paid' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                              item.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                              item.status === 'overdue' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {item.status === 'paid' ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Pago</>
                              ) : item.status === 'pending' ? (
                                <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                              ) : (
                                <><AlertCircle className="h-3 w-3 mr-1" /> Atrasado</>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-hubster-secondary border-hubster-secondary hover:bg-hubster-secondary/10"
                              onClick={() => handleUpdateReceivableStatus(item.id!, 'paid')}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Registrar Pgto
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recebimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este recebimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedReceivable(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReceivable}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Finance;
