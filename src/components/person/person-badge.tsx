import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface PersonBadgeProps {
  person: { id: string; name: string };
  className?: string;
  asLink?: boolean;
  size?: 'default' | 'sm';
}

export function PersonBadge({ person, className, asLink = false, size = 'default' }: PersonBadgeProps) {
  const badge = (
    <Badge
      variant='outline'
      className={cn(
        'flex items-center gap-1 pl-1 pr-2',
        asLink && 'hover:bg-muted',
        size === 'sm' && 'text-xs',
        className
      )}>
      <Avatar className={size === 'sm' ? 'size-4' : 'size-5'}>
        <AvatarFallback className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>{person.name?.[0]}</AvatarFallback>
      </Avatar>
      <span className='truncate'>{person.name}</span>
    </Badge>
  );

  if (asLink) {
    return <Link href={routes.person.byId({ id: person.id })}>{badge}</Link>;
  }

  return badge;
}
