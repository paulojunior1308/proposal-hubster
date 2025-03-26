import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ChartData {
  name: string;
  value: number;
  projetado: number;
}

interface ChartProps {
  className?: string;
  title: string;
  description?: string;
  data: ChartData[];
  type: 'line' | 'bar';
  dataKeys: string[];
  colors?: string[];
}

export const Chart: React.FC<ChartProps> = ({
  className,
  title,
  description,
  data,
  type = 'line',
  dataKeys,
  colors = ['#0077B6', '#6A0572', '#48BB78', '#F6AD55'],
}) => {
  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false}
          />
          <YAxis 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }} 
            itemStyle={{ color: 'var(--foreground)' }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
          />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      );
    }

    return (
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="name" 
          stroke="var(--muted-foreground)" 
          fontSize={12} 
          tickLine={false}
        />
        <YAxis 
          stroke="var(--muted-foreground)" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'var(--background)', 
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }} 
          itemStyle={{ color: 'var(--foreground)' }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
        />
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;
