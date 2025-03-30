'use client';

import { useUpdateAISummary } from '@/hooks/use-update-ai-summary';

import { clientEventBus } from './client-event-bus';
import {
  createPersonSummaryUpdatedEvent,
  InteractionCreatedEvent,
  PersonSummaryUpdatedEvent
} from './events';
import { useSubscribeToEventBus } from './use-event-bus';

export const EventBusSubscribers = () => {
  const updateSummary = useUpdateAISummary();

  useSubscribeToEventBus('Interaction.Created', (event: InteractionCreatedEvent['payload']) => {
    console.log('Interaction created:', event);
    console.log('Updating summary for person:', event.personId);
    const result = updateSummary.mutate({ personId: event.personId });
    console.log('Result:', result);
    clientEventBus.emit(createPersonSummaryUpdatedEvent({ personId: event.personId }));
  });

  useSubscribeToEventBus(
    'Person.Summary.Updated',
    (event: PersonSummaryUpdatedEvent['payload']) => {
      console.log('Person summary updated:', event);
    }
  );

  return null;
};
