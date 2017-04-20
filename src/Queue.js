import {
  isEmpty as isEmptyList,
  createEmpty,
  insertAfter,
  remove,
  forEach,
  next,
  previous,
} from './ll.js';

function Queue({
  onError,
  onEmpty,
  onItem,
} = {}) {
  this.items = createEmpty();
  this.version = 0;
  this.onError = onError;
  this.onEmpty = onEmpty;
  this.onItem = onItem;
  this.current = null;
}

Queue.prototype.isEmpty = function isEmpty() {
  return isEmptyList(this.items);
};

Queue.prototype.push = function push(item) {
  insertAfter(previous(this.items), item);
  this.process();
};

Queue.prototype.clear = function clear(err) {
  forEach(this.items, (item) => {
    if (typeof item.onStop === 'function') {
      item.onStop(err);
    }
  });
  this.items = createEmpty();
  this.paused = false;
  this.version += 1;
  this.current = null;
  this.scheduled = false;
};

Queue.prototype.cancel = function cancel(err) {
  if (this.currentCancel) {
    this.currentCancel(err);
    if (this.current.onStop) {
      this.current.onStop(err);
    }
  }
};

Queue.prototype.error = function error(err) {
  let shouldClear = true;
  if (typeof this.onError === 'function') {
    shouldClear = this.onError(err) !== false;
  }
  if (shouldClear) {
    this.clear(err);
  }
};

Queue.prototype.pause = function pause() {
  this.paused = true;
};

Queue.prototype.resume = function resume() {
  this.paused = false;
  this.process();
};

Queue.prototype.process = function () {
  if (this.scheduled) {
    return;
  }
  // NOTE: We need to defer to avoid "max call stack" errors.
  setTimeout(() => {
    this.scheduled = false;
    this._process();
  }, 0);
  this.scheduled = true;
};

Queue.prototype._process = function _process() {
  if (this.paused || this.current) {
    return;
  }
  if (this.isEmpty()) {
    if (typeof this.onEmpty === 'function') {
      this.onEmpty();
    }
  } else {
    const item = next(this.items);
    if (typeof this.onItem === 'function') {
      if (this.onItem(item) === false) {
        return;
      }
    }
    this.current = remove(item);
    //----------------------------------
    const currentVersion = this.version;
    const {
      action,
      onDone,
      noWait,
      isSync,
      params = [],
    } = this.current;
    let wasCalled = false;
    const cb = (err, res) => {
      if (!wasCalled && currentVersion === this.version) {
        wasCalled = true;
        this.current = null;
        this.currentCancel = null;
        // NOTE: This is quite important to call "onDone()" before "this.process()"
        //       because one may want to clear queue in done callback.
        if (typeof onDone === 'function') {
          onDone(err, res);
        }
        if (err) {
          this.error(err);
        }
        // NOTE: This is not the same thing as resume!
        this.process();
      }
    };
    this.currentCancel = err => cb(err);
    if (isSync) {
      try {
        cb(null, action(...params));
      } catch (err) {
        cb(err);
      }
    } else {
      action(...params, cb);
    }
    if (noWait) {
      this.current = null;
      this.currentCancel = null;
      this.process();
    }
  }
};

export default Queue;
