// lib/client-event-bus.ts
type EventCallback<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on<T = any>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>) {
    this.listeners[event] = (this.listeners[event] || []).filter((cb) => cb !== callback);
  }

  emit<T = any>(event: string, payload: T) {
    (this.listeners[event] || []).forEach((cb) => cb(payload));
    (this.listeners['*'] || []).forEach((cb) => cb({ event, payload }));
  }
}

export const clientEventBus = new EventBus();
