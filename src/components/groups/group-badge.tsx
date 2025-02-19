import Link from 'next/link';

import { OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { TPersonGroup } from '@/types/custom';

interface GroupBadgeProps {
  group: TPersonGroup;
  className?: string;
  asLink?: boolean;
  size?: 'default' | 'sm';
}

const IconMap: Record<string, React.ReactNode> = {
  '5': <OneRing className='size-2' />,
  '50': <TwoRing className='size-2' />,
  '100': <ThreeRing className='size-2' />
};

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
      <span className='mr-1'>{IconMap[group.icon] ? IconMap[group.icon] : group.icon}</span>
      {group.name}
    </Badge>
  );

  if (asLink) {
    return <Link href={routes.groups.byId({ id: group.id })}>{badge}</Link>;
  }

  return badge;
}
