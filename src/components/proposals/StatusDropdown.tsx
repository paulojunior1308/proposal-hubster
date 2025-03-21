import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalStatus } from '@/services/proposalService';

interface StatusDropdownProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

export const StatusDropdown = ({ currentStatus, onStatusChange }: StatusDropdownProps) => {
  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'waiting_client':
        return 'text-blue-500';
      case 'accepted':
        return 'text-green-500';
      case 'declined':
        return 'text-red-500';
      case 'paid':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: ProposalStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'waiting_client':
        return 'Aguardando Cliente';
      case 'accepted':
        return 'Aceita';
      case 'declined':
        return 'Recusada';
      case 'paid':
        return 'Paga';
      default:
        return status;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 font-normal",
            getStatusColor(currentStatus)
          )}
        >
          {getStatusLabel(currentStatus)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onStatusChange('pending')}>
          <span className={cn("mr-2", getStatusColor('pending'))}>
            {currentStatus === 'pending' && <Check className="h-4 w-4" />}
          </span>
          Pendente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('waiting_client')}>
          <span className={cn("mr-2", getStatusColor('waiting_client'))}>
            {currentStatus === 'waiting_client' && <Check className="h-4 w-4" />}
          </span>
          Aguardando Cliente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('accepted')}>
          <span className={cn("mr-2", getStatusColor('accepted'))}>
            {currentStatus === 'accepted' && <Check className="h-4 w-4" />}
          </span>
          Aceita
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('declined')}>
          <span className={cn("mr-2", getStatusColor('declined'))}>
            {currentStatus === 'declined' && <Check className="h-4 w-4" />}
          </span>
          Recusada
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('paid')}>
          <span className={cn("mr-2", getStatusColor('paid'))}>
            {currentStatus === 'paid' && <Check className="h-4 w-4" />}
          </span>
          Paga
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 