import { GroupBadge } from '@/components/groups/group-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SimpleSearchPeopleResult } from '@/types/custom';

interface SearchPersonItemProps {
  person: SimpleSearchPeopleResult;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchPersonItem({ person, isSelected, onClick }: SearchPersonItemProps) {
  // Get initials for avatar
  const initials = `${person.first_name[0]}${person?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected && 'border-primary bg-primary/5'
      )}>
      <Avatar className='size-10 shrink-0'>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <div className='font-medium'>
          {person.first_name} {person.last_name}
        </div>
        <div className='line-clamp-2 text-sm text-muted-foreground'>{person.bio}</div>
        {person.groups && person.groups.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
            {person.groups.map((group) => (
              <GroupBadge key={group.id} group={group} size='sm' />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
