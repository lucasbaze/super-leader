import { EventNames } from './event-names';

export type EventName = EventNames | '*';

export type BuildEvent<Name extends EventNames, Data> = { eventName: Name; data: Data };

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type EventTemplate = { eventName: EventName; data: Record<string, Json> };

export type EmitData<TEvent extends EventTemplate> = TEvent & {
  options?: any;
};
