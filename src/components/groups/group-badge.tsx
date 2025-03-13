import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { IconMap } from '@/lib/ui/icon-map';
import { cn } from '@/lib/utils';
import type { PersonGroup } from '@/types/custom';

interface GroupBadgeProps {
  group: PersonGroup;
  className?: string;
  asLink?: boolean;
  size?: 'default' | 'sm';
}

export function GroupBadge({
  group,
  className,
  asLink = false,
  size = 'default'
}: GroupBadgeProps) {
  const badge = (
    <Badge
      variant='secondary'
      className={cn(asLink && 'hover:bg-muted', size === 'sm' && 'text-xs', className)}>
      {/* <span className='mr-1'>{group.icon}</span> */}
      <span className='mr-1'>{IconMap[group.icon] ? IconMap[group.icon]() : group.icon}</span>
      {group.name}
    </Badge>
  );

  if (asLink) {
    return <Link href={routes.groups.byId({ id: group.id })}>{badge}</Link>;
  }

  return badge;
}
