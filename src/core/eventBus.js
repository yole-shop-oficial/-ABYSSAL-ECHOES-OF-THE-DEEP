// Simple event bus for decoupled systems
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    const list = this.listeners.get(event);
    if (!list) return;
    const i = list.indexOf(fn);
    if (i !== -1) list.splice(i, 1);
  }
  emit(event, payload) {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const fn of [...list]) {
      try { fn(payload); } catch (e) { console.error('[eventBus]', event, e); }
    }
  }
}

export const bus = new EventBus();
export default bus;
