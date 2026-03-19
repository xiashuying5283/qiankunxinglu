'use client';

import { useState } from 'react';
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
import { User, LogOut, UserCircle2, Mail, LogIn, UserPlus } from 'lucide-react';
import { LoginDialog } from './LoginDialog';

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className="text-white/70">
        <User className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowLoginDialog(true)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            登录
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowLoginDialog(true)}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            注册
          </Button>
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          title="登录账户"
          description="登录后可以保存您的占卜记录，随时查看历史"
        />
      </>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white/80 hover:text-white hover:bg-white/10">
          {user.isGuest ? (
            <UserCircle2 className="h-5 w-5 mr-2" />
          ) : (
            <User className="h-5 w-5 mr-2" />
          )}
          <span className="max-w-[100px] truncate">{user.name || '用户'}</span>
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
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
