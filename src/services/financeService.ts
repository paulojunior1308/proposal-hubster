import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Proposal } from './proposalService';

export interface FinanceData {
  month: string;
  value: number;
  projectedValue: number;
}

export interface Receivable {
  id?: string;
  proposalId: string;
  client: string;
  value: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceMetrics {
  total: number;
  average: number;
  projected: number;
  growth: number;
  currentMonth: number;
  previousMonth: number;
  monthlyGrowth: number;
}

const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const financeService = {
  // Buscar dados financeiros do ano
  async getFinanceData(userId: string, year: string): Promise<FinanceData[]> {
    try {
      // Buscar todas as propostas aprovadas do ano
      const proposalsRef = collection(db, 'proposals');
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      
      const q = query(
        proposalsRef,
        where('userId', '==', userId),
        where('status', '==', 'approved'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const proposals = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      })) as Proposal[];

      // Inicializar array com todos os meses
      const monthlyData = monthNames.map((month, index) => ({
        month,
        value: 0,
        projectedValue: 0
      }));

      // Calcular valores realizados por mês
      proposals.forEach(proposal => {
        const month = proposal.date.getMonth();
        monthlyData[month].value += proposal.value;
      });

      // Calcular projeções baseadas na média dos últimos 3 meses
      for (let i = 0; i < monthlyData.length; i++) {
        const lastThreeMonths = monthlyData
          .slice(Math.max(0, i - 3), i)
          .reduce((acc, curr) => acc + curr.value, 0);
        
        const average = lastThreeMonths / Math.min(i, 3) || monthlyData[i].value;
        monthlyData[i].projectedValue = average * 1.1; // 10% de crescimento projetado
      }

      return monthlyData;
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      throw error;
    }
  },

  // Criar/Atualizar dado financeiro
  async upsertFinanceData(data: Omit<FinanceData, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const financeRef = collection(db, 'finances');
      const q = query(
        financeRef,
        where('userId', '==', data.userId),
        where('year', '==', data.year),
        where('month', '==', data.month)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Atualizar dado existente
        const docRef = doc(db, 'finances', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
        return { id: querySnapshot.docs[0].id, ...data };
      } else {
        // Criar novo dado
        const docRef = await addDoc(collection(db, 'finances'), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return { id: docRef.id, ...data };
      }
    } catch (error) {
      console.error('Erro ao salvar dado financeiro:', error);
      throw error;
    }
  },

  // Buscar recebimentos
  async getReceivables(userId: string): Promise<Receivable[]> {
    try {
      const receivablesRef = collection(db, 'receivables');
      const q = query(
        receivablesRef,
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        dueDate: doc.data().dueDate.toDate()
      })) as Receivable[];
    } catch (error) {
      console.error('Erro ao buscar recebimentos:', error);
      throw error;
    }
  },

  // Criar recebimento
  async createReceivable(receivable: Omit<Receivable, 'id'>): Promise<string> {
    try {
      const receivablesRef = collection(db, 'receivables');
      const docRef = await addDoc(receivablesRef, {
        ...receivable,
        dueDate: Timestamp.fromDate(receivable.dueDate)
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      throw error;
    }
  },

  // Atualizar recebimento
  async updateReceivable(id: string, data: Partial<Receivable>): Promise<void> {
    try {
      const receivableRef = doc(db, 'receivables', id);
      if (data.dueDate) {
        data.dueDate = Timestamp.fromDate(data.dueDate) as any;
      }
      await updateDoc(receivableRef, data);
    } catch (error) {
      console.error('Erro ao atualizar recebimento:', error);
      throw error;
    }
  },

  // Excluir recebimento
  async deleteReceivable(id: string): Promise<void> {
    try {
      const receivableRef = doc(db, 'receivables', id);
      await deleteDoc(receivableRef);
    } catch (error) {
      console.error('Erro ao excluir recebimento:', error);
      throw error;
    }
  },

  // Calcular métricas
  calculateMetrics(financeData: FinanceData[]): FinanceMetrics {
    const total = financeData.reduce((acc, curr) => acc + curr.value, 0);
    const projectedTotal = financeData.reduce((acc, curr) => acc + curr.projectedValue, 0);
    const nonZeroMonths = financeData.filter(data => data.value > 0).length || 1;
    
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    return {
      total,
      average: total / nonZeroMonths,
      projected: projectedTotal,
      growth: ((total / projectedTotal) - 1) * 100,
      currentMonth: financeData[currentMonth]?.value || 0,
      previousMonth: financeData[previousMonth]?.value || 0,
      monthlyGrowth: financeData[currentMonth]?.value && financeData[previousMonth]?.value
        ? ((financeData[currentMonth].value / financeData[previousMonth].value) - 1) * 100
        : 0
    };
  }
}; 