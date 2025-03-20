
import React from 'react';
import { Search, Bell, User, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  return (
    <header
      className={cn(
        'h-16 border-b border-border bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between',
        className
      )}
    >
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-10 bg-background border-muted"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2 border-hubster-secondary text-hubster-secondary hover:bg-hubster-secondary/10">
          <Plus size={16} />
          <span>Nova Proposta</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-hubster-secondary rounded-full"></span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
