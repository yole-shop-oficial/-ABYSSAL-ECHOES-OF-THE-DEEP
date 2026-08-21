/**
 * EventBus — Sistema de eventos global desacoplado
 * Permite comunicación entre sistemas sin referencias directas
 */
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback, context = null) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push({ callback, context });
    return this;
  }

  off(event, callback) {
    if (!this._listeners.has(event)) return this;
    const list = this._listeners.get(event).filter(l => l.callback !== callback);
    this._listeners.set(event, list);
    return this;
  }

  emit(event, data = {}) {
    if (!this._listeners.has(event)) return;
    const listeners = [...this._listeners.get(event)];
    for (const { callback, context } of listeners) {
      try {
        callback.call(context, data);
      } catch (e) {
        console.error(`[EventBus] Error in listener for "${event}":`, e);
      }
    }
  }

  once(event, callback, context = null) {
    const wrapper = (data) => {
      callback.call(context, data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  clear(event) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}

// Singleton global
export const globalBus = new EventBus();
