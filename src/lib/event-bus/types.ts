import { EventNames } from './event-names';

export type EventName = EventNames | '*';

export type BuildEvent<Name extends EventNames, Payload> = { eventName: Name; payload: Payload };

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type EventTemplate = { eventName: EventName; payload: Record<string, Json> };

export type EmitData<TEvent extends EventTemplate> = TEvent & {
  options?: any;
};
