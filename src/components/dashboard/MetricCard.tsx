
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  FileText, 
  Calendar, 
  DollarSign
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'glass-card p-6 rounded-xl card-hover flex flex-col animate-scale',
  {
    variants: {
      variant: {
        default: 'border-l-4 border-l-hubster-secondary',
        primary: 'border-l-4 border-l-hubster-primary',
        success: 'border-l-4 border-l-green-500',
        warning: 'border-l-4 border-l-amber-500',
        danger: 'border-l-4 border-l-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MetricCardProps extends VariantProps<typeof cardVariants> {
  className?: string;
  title: string;
  value: string | number;
  icon: 'chart' | 'file' | 'calendar' | 'money';
  changeValue?: number;
  changeText?: string;
  footer?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  className,
  title,
  value,
  icon,
  variant,
  changeValue = 0,
  changeText,
  footer,
}) => {
  const iconComponents = {
    chart: BarChart3,
    file: FileText,
    calendar: Calendar,
    money: DollarSign,
  };

  const IconComponent = iconComponents[icon];

  return (
    <div className={cn(cardVariants({ variant }), className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-background/50 rounded-lg dark:bg-foreground/5">
          <IconComponent className="h-6 w-6 text-hubster-secondary" />
        </div>
      </div>

      {(changeValue !== undefined || changeText) && (
        <div className="flex items-center text-sm mt-2">
          {changeValue !== 0 && (
            <>
              {changeValue > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : changeValue < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground mr-1" />
              )}
              <span
                className={cn(
                  'font-medium',
                  changeValue > 0 ? 'text-green-500' : 
                  changeValue < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {changeValue > 0 ? '+' : ''}{changeValue}%
              </span>
            </>
          )}
          {changeText && (
            <span className="text-muted-foreground ml-1">{changeText}</span>
          )}
        </div>
      )}

      {footer && (
        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
