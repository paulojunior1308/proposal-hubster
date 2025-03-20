
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Chart } from '@/components/dashboard/Chart';
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

const revenueData = [
  { name: 'Jan', valor: 16500, projetado: 18000 },
  { name: 'Fev', valor: 15200, projetado: 18000 },
  { name: 'Mar', valor: 21000, projetado: 18000 },
  { name: 'Abr', valor: 19500, projetado: 19000 },
  { name: 'Mai', valor: 23800, projetado: 19000 },
  { name: 'Jun', valor: 22000, projetado: 19000 },
  { name: 'Jul', valor: 24500, projetado: 20000 },
  { name: 'Ago', valor: 21800, projetado: 20000 },
  { name: 'Set', valor: 25400, projetado: 20000 },
  { name: 'Out', valor: 28000, projetado: 22000 },
  { name: 'Nov', valor: 0, projetado: 22000 },
  { name: 'Dez', valor: 0, projetado: 22000 },
];

const receivables = [
  { id: 'FAT-2024-056', client: 'Empresa ABC', value: 'R$ 12.500,00', dueDate: '15/05/2024', status: 'pending' },
  { id: 'FAT-2024-055', client: 'StartUp XYZ', value: 'R$ 8.750,00', dueDate: '10/05/2024', status: 'paid' },
  { id: 'FAT-2024-054', client: 'Consultoria 123', value: 'R$ 15.200,00', dueDate: '05/05/2024', status: 'paid' },
  { id: 'FAT-2024-053', client: 'Tech Solutions', value: 'R$ 9.800,00', dueDate: '30/04/2024', status: 'overdue' },
  { id: 'FAT-2024-052', client: 'Agência Digital', value: 'R$ 6.400,00', dueDate: '25/04/2024', status: 'paid' },
];

const Finance = () => {
  const [year, setYear] = React.useState('2024');

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
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
                value="R$ 198.450,00" 
                icon="money"
                variant="primary"
                changeValue={12}
                changeText="vs. ano anterior"
              />
              <MetricCard 
                title="Faturamento Mensal" 
                value="R$ 28.000,00" 
                icon="chart"
                variant="success"
                changeValue={15}
                changeText="vs. mês anterior"
              />
              <MetricCard 
                title="Média Mensal" 
                value="R$ 20.854,00" 
                icon="calendar"
                variant="default"
                changeValue={8}
                changeText="vs. ano anterior"
              />
              <MetricCard 
                title="Previsão Anual" 
                value="R$ 235.000,00" 
                icon="money"
                variant="warning"
                changeValue={18}
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
                      data={revenueData} 
                      type="bar" 
                      dataKeys={['valor', 'projetado']}
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
                        <p className="text-xl font-bold">R$ 12.800</p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> +8% esse ano
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-hubster-secondary/10 mr-3">
                          <BadgePercent className="h-5 w-5 text-hubster-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Taxa de Conversão</p>
                          <p className="text-xs text-muted-foreground">Propostas aceitas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">68%</p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> +5% esse ano
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-amber-500/10 mr-3">
                          <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Projeção Q4</p>
                          <p className="text-xs text-muted-foreground">Outubro-Dezembro</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">R$ 85.000</p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> +15% vs Q3
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-500/10 mr-3">
                          <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Previsão 2025</p>
                          <p className="text-xs text-muted-foreground">Crescimento projetado</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">R$ 280.000</p>
                        <div className="flex items-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" /> +20% anual
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
                    {receivables.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {item.dueDate}
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
                          <Button variant="outline" size="sm" className="text-hubster-secondary border-hubster-secondary hover:bg-hubster-secondary/10">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Registrar Pgto
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

export default Finance;
