import { useState } from 'react';

import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Gift,
  Mail,
  MessageSquare,
  NotebookPen,
  Users
} from '@/components/icons';
import { dateHandler, formatAsDate } from '@/lib/dates/helpers';
import { cn } from '@/lib/utils';
import { TInteraction } from '@/services/person/person-activity';

interface ActivityTimelineProps {
  interactions: TInteraction[];
}

// Map of interaction types to their corresponding icons
const interactionIconMap = {
  invitation: Users,
  email: Mail,
  reminder: Bell,
  gift: Gift,
  note: NotebookPen,
  'text message': MessageSquare,
  meeting: Users
};

// Function to capitalize words in a string
const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Timeline Item Component
interface TimelineItemProps {
  interaction: TInteraction;
  isLast: boolean;
}

function TimelineItem({ interaction, isLast }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const interactionType = interaction.type || 'unknown';
  const IconComponent =
    interactionIconMap[interactionType as keyof typeof interactionIconMap] || Calendar;

  // Determine if we should show the expand/collapse button
  const shouldCollapse = interaction.note && interaction.note.length > 400;

  return (
    <div className='relative flex gap-4'>
      {/* Icon with vertical line */}
      <div className='relative flex flex-col items-center'>
        <div className='mt-1'>
          <div className='flex size-8 items-center justify-center rounded-full bg-muted'>
            <IconComponent className='size-4 text-muted-foreground' />
          </div>
        </div>

        {/* Vertical line connecting to the next item */}
        {!isLast && <div className='absolute bottom-0 top-10 w-0.5 bg-muted' />}
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col pb-6'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{capitalizeWords(interactionType)}</span>
          <span className='text-xs text-muted-foreground'>
            {formatAsDate(dateHandler(interaction.created_at || new Date()), 'MMM D, YYYY')}
          </span>
        </div>

        {interaction.note && (
          <div className='relative mt-1'>
            <div
              className={cn(
                'overflow-hidden rounded-md bg-sidebar px-3 py-2 text-muted-foreground transition-all duration-200',
                shouldCollapse && !isExpanded && 'max-h-[130px]'
              )}>
              {interaction.note}
            </div>

            {shouldCollapse && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='absolute -bottom-4 right-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'>
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className='size-4' />
                  </>
                ) : (
                  <>
                    <span>Show more</span>
                    <ChevronDown className='size-4' />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTimeline({ interactions }: ActivityTimelineProps) {
  if (!interactions.length) {
    return <div className='py-8 text-center text-muted-foreground'>No activity recorded yet</div>;
  }

  return (
    <div className='space-y-0'>
      {interactions.map((interaction, index) => (
        <TimelineItem
          key={interaction.id}
          interaction={interaction}
          isLast={index === interactions.length - 1}
        />
      ))}
    </div>
  );
}
