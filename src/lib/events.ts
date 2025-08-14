// Système d'événements pour la synchronisation des données
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
}

export const appEvents = new EventEmitter();

// Types d'événements
export const EVENTS = {
  MENUS_UPDATED: 'menus_updated',
  PRODUCTS_UPDATED: 'products_updated',
  SETTINGS_UPDATED: 'settings_updated',
  CATEGORIES_UPDATED: 'categories_updated',
  FARMS_UPDATED: 'farms_updated'
};