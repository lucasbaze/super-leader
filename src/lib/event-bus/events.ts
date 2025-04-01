import { BuildEvent, EmitData } from './types';

export type InteractionCreatedEvent = BuildEvent<
  'Interaction.Created',
  { personId: string; userId: string; personName: string }
>;
type CreateInteractionCreatedEvent = Pick<
  InteractionCreatedEvent['payload'],
  'personId' | 'userId' | 'personName'
>;
export const createInteractionCreatedEvent = ({
  personId,
  personName,
  userId
}: CreateInteractionCreatedEvent): EmitData<InteractionCreatedEvent> => ({
  eventName: 'Interaction.Created',
  payload: { personId, personName, userId },
  options: {}
});

export type PersonSummaryUpdatedEvent = BuildEvent<
  'Person.Summary.Updated',
  { personId: string; userId: string; personName: string }
>;
type CreatePersonSummaryUpdatedEvent = Pick<
  PersonSummaryUpdatedEvent['payload'],
  'personId' | 'userId' | 'personName'
>;
export const createPersonSummaryUpdatedEvent = ({
  personId,
  personName,
  userId
}: CreatePersonSummaryUpdatedEvent): EmitData<PersonSummaryUpdatedEvent> => ({
  eventName: 'Person.Summary.Updated',
  payload: { personId, personName, userId },
  options: {}
});
