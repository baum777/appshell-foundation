import { useState } from 'react';
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

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Quick actions"
          >
            <Plus className={`h-6 w-6 transition-transform ${open ? 'rotate-45' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
          <DropdownMenuItem 
            onClick={() => navigate('/journal')}
            className="cursor-pointer gap-2"
          >
            <PenLine className="h-4 w-4" />
            Log entry
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/alerts')}
            className="cursor-pointer gap-2"
          >
            <Bell className="h-4 w-4" />
            Create alert
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
