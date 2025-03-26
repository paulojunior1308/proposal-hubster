export interface MonthlyData {
  month: string;
  value: number;
  projectedValue: number;
}

export interface FinanceData extends MonthlyData {
  id: string;
  userId: string;
  year: string;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

export interface ChartData {
  name: string;
  value: number;
  projetado: number;
} 