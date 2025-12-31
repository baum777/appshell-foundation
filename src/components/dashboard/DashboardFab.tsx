import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, PenLine, Bell } from 'lucide-react';

export function DashboardFab() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40"
      role="group"
      aria-label="Quick actions"
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl focus-visible:ring-offset-background transition-all duration-200"
            aria-label="Open quick actions menu"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <Plus 
              className={`h-6 w-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} 
              aria-hidden="true" 
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          side="top" 
          className="w-48 mb-2"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem 
            onClick={() => {
              navigate('/journal');
              setOpen(false);
            }}
            className="cursor-pointer gap-2 focus:bg-accent"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Log entry
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              navigate('/alerts');
              setOpen(false);
            }}
            className="cursor-pointer gap-2 focus:bg-accent"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            Create alert
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
