/* eslint-env jest */
import EventEmitter from './EventEmitter.js';

describe('Test EventEmitter', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.emitter = new EventEmitter();
  });

  describe('Given a single listener is registered', () => {
    beforeEach(() => {
      testContext.spy1 = jest.fn();
      testContext.stop = testContext.emitter.on('EVENT', testContext.spy1);
    });

    test('should be triggered when event is emitted', () => {
      const object = {};
      testContext.emitter.emit('EVENT', object);
      expect(testContext.spy1).toHaveBeenCalledWith(object);
    });

    test('should not be triggered if other event is emitted', () => {
      const object = {};
      testContext.emitter.emit('__EVENT', object);
      expect(testContext.spy1).not.toHaveBeenCalled();
    });

    test('should be triggered multiple times', () => {
      const object = {};
      testContext.emitter.emit('EVENT', object);
      testContext.emitter.emit('EVENT', object);
      expect(testContext.spy1).toHaveBeenCalledTimes(2);
    });

    test('should not be triggered if stopped on time', () => {
      testContext.stop();
      testContext.emitter.emit('EVENT');
      expect(testContext.spy1).not.toHaveBeenCalled();
    });
  });

  describe('Given a single once-time listener is registered', () => {
    beforeEach(() => {
      testContext.spy1 = jest.fn();
      testContext.stop = testContext.emitter.once('EVENT', testContext.spy1);
    });

    test('should be triggered when event is emitted', () => {
      const object = {};
      testContext.emitter.emit('EVENT', object);
      expect(testContext.spy1).toHaveBeenCalledWith(object);
    });

    test('should not be triggered if other event is emitted', () => {
      const object = {};
      testContext.emitter.emit('__EVENT', object);
      expect(testContext.spy1).not.toHaveBeenCalled();
    });

    test('should not be triggered multiple times', () => {
      const object = {};
      testContext.emitter.emit('EVENT', object);
      testContext.emitter.emit('EVENT', object);
      expect(testContext.spy1).toHaveBeenCalledTimes(1);
    });

    test('should not be triggered if stopped on time', () => {
      testContext.stop();
      testContext.emitter.emit('EVENT');
      expect(testContext.spy1).not.toHaveBeenCalled();
    });
  });

  describe('Given a new listener is added in a callback', () => {
    beforeEach(() => {
      testContext.spy1 = jest.fn();
      testContext.spy2 = jest.fn();
      testContext.stop = testContext.emitter.once('EVENT', () => {
        testContext.spy1();
        testContext.emitter.once('EVENT', testContext.spy2);
      });
    });

    test('should be triggered when event is emitted', () => {
      testContext.emitter.emit('EVENT');
      expect(testContext.spy1).toHaveBeenCalledTimes(1);
    });

    test('the other callback should not be triggered at first', () => {
      testContext.emitter.emit('EVENT');
      expect(testContext.spy2).not.toHaveBeenCalled();
    });

    test('the other callback should ne triggered after second emit', () => {
      testContext.emitter.emit('EVENT');
      testContext.emitter.emit('EVENT');
      expect(testContext.spy1).toHaveBeenCalledTimes(1);
      expect(testContext.spy2).toHaveBeenCalledTimes(1);
    });

    test('further calls should be idepmpotent', () => {
      testContext.emitter.emit('EVENT');
      testContext.emitter.emit('EVENT');
      testContext.emitter.emit('EVENT');
      expect(testContext.spy1).toHaveBeenCalledTimes(1);
      expect(testContext.spy2).toHaveBeenCalledTimes(1);
    });
  });
});
