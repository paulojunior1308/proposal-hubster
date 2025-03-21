import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Proposal } from './proposalService';
import { Receivable } from './financeService';

export interface DashboardData {
  totalProposals: number;
  activeProposals: number;
  pendingProposals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingReceivables: number;
  overdueReceivables: number;
  recentProposals: Proposal[];
  recentReceivables: Receivable[];
  monthlyData: {
    month: string;
    value: number;
  }[];
}

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Buscar propostas
      const proposalsRef = collection(db, 'proposals');
      const proposalsQuery = query(
        proposalsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const proposalsSnapshot = await getDocs(proposalsQuery);
      const proposals = proposalsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      })) as Proposal[];

      // Buscar recebimentos
      const receivablesRef = collection(db, 'receivables');
      const receivablesQuery = query(
        receivablesRef,
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
      );
      const receivablesSnapshot = await getDocs(receivablesQuery);
      const receivables = receivablesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        dueDate: doc.data().dueDate.toDate()
      })) as Receivable[];

      // Calcular métricas
      const totalProposals = proposals.length;
      const activeProposals = proposals.filter(p => p.status === 'accepted').length;
      const pendingProposals = proposals.filter(p => p.status === 'pending').length;
      
      const totalRevenue = proposals
        .filter(p => p.status === 'accepted')
        .reduce((acc, curr) => acc + curr.value, 0);

      const currentMonth = new Date().getMonth();
      const monthlyRevenue = proposals
        .filter(p => p.status === 'accepted' && p.date.getMonth() === currentMonth)
        .reduce((acc, curr) => acc + curr.value, 0);

      const pendingReceivables = receivables.filter(r => r.status === 'pending').length;
      const overdueReceivables = receivables.filter(r => r.status === 'overdue').length;

      // Dados mensais para o gráfico
      const monthlyData = monthNames.map((month, index) => ({
        month,
        value: proposals
          .filter(p => p.status === 'accepted' && p.date.getMonth() === index)
          .reduce((acc, curr) => acc + curr.value, 0)
      }));

      return {
        totalProposals,
        activeProposals,
        pendingProposals,
        totalRevenue,
        monthlyRevenue,
        pendingReceivables,
        overdueReceivables,
        recentProposals: proposals.slice(0, 5),
        recentReceivables: receivables.slice(0, 5),
        monthlyData
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }
}; 