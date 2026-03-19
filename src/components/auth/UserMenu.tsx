'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, UserCircle2, Mail } from 'lucide-react';

interface UserMenuProps {
  onLogout?: () => void;
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {user.isGuest ? (
            <UserCircle2 className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
          {user.isGuest && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name || '用户'}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </p>
            )}
            {user.isGuest && (
              <span className="text-xs text-amber-500">游客模式</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
