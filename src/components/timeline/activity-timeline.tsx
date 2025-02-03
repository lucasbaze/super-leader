import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import { TInteraction } from '@/services/people/person-activity';

interface ActivityTimelineProps {
  interactions: TInteraction[];
}

export function ActivityTimeline({ interactions }: ActivityTimelineProps) {
  if (!interactions.length) {
    return <div className='py-8 text-center text-muted-foreground'>No activity recorded yet</div>;
  }

  return (
    <div className='space-y-8'>
      {interactions.map((interaction) => (
        <div key={interaction.id} className='flex gap-4'>
          <div className='mt-1'>
            <div className='flex size-8 items-center justify-center rounded-full bg-muted'>
              <CalendarDays className='size-4 text-muted-foreground' />
            </div>
          </div>
          <div className='flex flex-1 flex-col'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>{interaction.type}</span>
              <span className='text-xs text-muted-foreground'>
                {format(new Date(interaction.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {interaction.note && (
              <p className='mt-1 rounded-md bg-muted/30 p-2 text-muted-foreground'>
                {interaction.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
