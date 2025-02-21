'use client';

import { useTransition } from 'react';

import { logout } from '@/app/login/actions';
import {
  BadgeCheck,
  ComponentPlaceholderIcon,
  LifeBuoy,
  LogOut,
  Send,
  Sparkles
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRecentlyViewedStore } from '@/stores/use-recently-viewed-store';

import { CopyWithTooltip } from './ui/copy-with-tooltip';

export function NavUser({
  user
}: {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const clearAll = useRecentlyViewedStore((state) => state.clearAll);

  const handleLogout = () => {
    startTransition(async () => {
      clearAll();
      await logout();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='size-8'>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
        side={'bottom'}
        align='end'
        sideOffset={4}>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Avatar className='size-8 rounded-lg'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              <span className='truncate text-xs'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <CopyWithTooltip content={user.id}>
            <DropdownMenuItem>
              <Sparkles />
              {user.id}
            </DropdownMenuItem>
          </CopyWithTooltip>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ComponentPlaceholderIcon />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send />
            Feedback
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
          <LogOut />
          {isPending ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
