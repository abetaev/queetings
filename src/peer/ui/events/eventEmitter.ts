export enum EventTypes {
  /* Myself controls Events */
  BAR_VIEW_DECORATION_IS_CHANGED = 'BAR_VIEW_DECORATION_IS_CHANGED',
}

type EventCallback = (data: any, unsubscribe: () => void) => void

class EventEmitterService {
  public eventTypes = EventTypes;

  private events: { [key in keyof EventTypes]?: EventCallback } = {};

  public dispatch(event: EventTypes, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback: EventCallback) => callback(data, () => { EventEmitter.unsubscribe(event, callback) }));
  }

  public subscribe(event: EventTypes | EventTypes[], callback: EventCallback) {
    if (Array.isArray(event)) {
      event.forEach(oneOfEvent => {
        this.subscribeInternal(oneOfEvent, callback);
      });
    } else {
      this.subscribeInternal(event, callback);
    }
  }

  public unsubscribe(event: EventTypes, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((eventCallback: EventCallback) => eventCallback !== callback);
    }
  }

  private subscribeInternal(event: EventTypes, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
}

export const EventEmitter = new EventEmitterService();
