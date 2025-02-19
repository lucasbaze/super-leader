'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type TSimpleSearchListItemProps = {
  person: {
    id: string;
    first_name: string;
    last_name: string | null;
  };
  index: number;
  activeIndex: number;
  onSelect: (personId: string) => void;
};

export function SimpleSearchListItem({
  person,
  index,
  activeIndex,
  onSelect
}: TSimpleSearchListItemProps) {
  return (
    <button
      role='option'
      aria-selected={activeIndex === index}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
        'hover:bg-muted',
        activeIndex === index && 'bg-muted'
      )}
      onClick={() => onSelect(person.id)}>
      <Avatar className='size-6 shrink-0'>
        <AvatarImage src={undefined} alt={`${person.first_name} ${person.last_name}`} />
        <AvatarFallback>{person.first_name[0]}</AvatarFallback>
      </Avatar>
      <div className='flex flex-col'>
        <span className='font-medium'>
          {person.first_name} {person.last_name}
        </span>
      </div>
    </button>
  );
}
