// lib/client-event-bus.ts
type EventCallback<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on<T = any>(eventName: string, callback: EventCallback<T>) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off<T = any>(eventName: string, callback: EventCallback<T>) {
    this.listeners[eventName] = (this.listeners[eventName] || []).filter((cb) => cb !== callback);
  }

  emit<T = any>({ eventName, payload }: { eventName: string; payload: T }) {
    (this.listeners[eventName] || []).forEach((cb) => cb(payload));
    (this.listeners['*'] || []).forEach((cb) => cb({ eventName, payload }));
  }
}

export const clientEventBus = new EventBus();
