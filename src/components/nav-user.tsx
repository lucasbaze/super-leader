'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { logout } from '@/app/login/actions';
import { BadgeCheck, CircleUser, ComponentPlaceholderIcon, LifeBuoy, LogOut, Send, Sparkles } from '@/components/icons';
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
import { clearQueryCache } from '@/lib/react-query';
import { routes } from '@/lib/routes';
import { useRecentlyViewedStore } from '@/stores/use-recently-viewed-store';

import { CopyWithTooltip } from './ui/copy-with-tooltip';

export function NavUser({
  user
}: {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const clearAll = useRecentlyViewedStore((state) => state.clearAll);
  const router = useRouter();
  const handleLogout = () => {
    startTransition(async () => {
      clearAll();
      clearQueryCache();
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
              <CopyWithTooltip content={user.id}>
                <div className='w-36 truncate text-xs'>{user.id}</div>
              </CopyWithTooltip>
            </div>
          </div>
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuGroup>
          <CopyWithTooltip content={user.id}>
            <DropdownMenuItem>
              <Sparkles />
              {user.id}
            </DropdownMenuItem>
          </CopyWithTooltip>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem> */}
          {/* <DropdownMenuItem>
            <ComponentPlaceholderIcon />
            Billing
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => router.push(routes.context.root())}>
            <CircleUser />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(routes.settings.customFields())}>
            <LifeBuoy />
            Settings
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <Send />
            Feedback
          </DropdownMenuItem> */}
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
