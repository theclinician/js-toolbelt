import {
  isEmpty,
  forEach,
  remove,
  createEmpty,
  insertAfter,
} from './ll.js';

const printError = (...args) => console.error(...args);

class EventEmitter {
  constructor() {
    this._listeners = {};
    this._errors = {};
  }

  captureUnhandledErrors(events, onError) {
    events.forEach((name) => {
      this._errors[name] = onError || printError;
    });
  }

  emit(name, ...args) {
    if (this._errors[name] && (!this._listeners[name] || isEmpty(this._listeners[name]))) {
      this._errors[name](...args);
    }
    forEach(this._listeners[name], (listener) => {
      listener.callback(...args);
      if (listener.once) {
        remove(listener);
      }
    });
  }

  addListener(name, callback, { once = false } = {}) {
    if (!this._listeners[name]) {
      this._listeners[name] = createEmpty();
    }
    let node = insertAfter(this._listeners[name], {
      once,
      callback,
    });
    return () => {
      if (node) {
        remove(node);
        node = null;
        if (this._listeners[name] && isEmpty(this._listeners[name])) {
          delete this._listeners[name];
        }
      }
    };
  }

  stopAll(name) {
    forEach(this._listeners[name], listener => remove(listener));
    delete this._listeners[name];
  }

  on(name, callback) {
    return this.addListener(name, callback, { once: false });
  }

  once(name, callback) {
    return this.addListener(name, callback, { once: true });
  }

  pipe(events, emitter) {
    const listeners = events.map(name => this.on(name, emitter.emit.bind(emitter, name)));
    return () => {
      listeners.forEach(stop => stop());
    };
  }
}

export default EventEmitter;
