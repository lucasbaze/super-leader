import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TPersonGroup } from '@/types/custom';

interface GroupBadgeProps {
  group: TPersonGroup;
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
      <span className='mr-2'>{group.icon}</span>
      {group.name}
    </Badge>
  );

  if (asLink) {
    return <Link href={`/app/groups/${group.slug}`}>{badge}</Link>;
  }

  return badge;
}
