/* eslint-env jest */
import Queue from './Queue.js';

jest.useFakeTimers();

describe('Test Queue', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  beforeEach(() => {
    testContext.queue = new Queue({
      onError: (error) => {
        throw error;
      },
    });
  });

  describe('Given the queue is empty', () => {
    test('should recognize that it is empty', () => {
      expect(testContext.queue.isEmpty()).toBe(true);
    });
  });

  describe('Given the queue contains one item', () => {
    beforeEach(() => {
      testContext.action = jest.fn();
      testContext.queue.pause();
      testContext.queue.push({
        action: testContext.action,
        isSync: true,
      });
    });
    describe('unless resume is called', () => {
      test('should recognize that it is not empty', () => {
        expect(testContext.queue.isEmpty()).toBe(false);
      });
    });
    describe('after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(0);
      });
      test('should call execute action', () => {
        expect(testContext.action).toHaveBeenCalled();
      });
      test('should become empty', () => {
        expect(testContext.queue.isEmpty()).toBe(true);
      });
    });
  });

  describe('Given the queue contains one asynchronous', () => {
    beforeEach(() => {
      testContext.spy = jest.fn();
      testContext.params = {};
      testContext.action = (params, cb) => {
        setTimeout(() => {
          testContext.spy(params);
          cb();
        }, 100);
      };
      testContext.queue.pause();
      testContext.queue.push({
        params: [testContext.params],
        action: testContext.action,
      });
    });
    describe('immediately after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(0);
      });
      test('should not execute action yet', () => {
        expect(testContext.spy).not.toHaveBeenCalled();
      });
      test('should be empty', () => {
        expect(testContext.queue.isEmpty()).toBe(true);
      });
    });
    describe('some time after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(100);
      });
      test('should execute action', () => {
        expect(testContext.spy).toHaveBeenCalledWith(testContext.params);
      });
      test('should be empty', () => {
        expect(testContext.queue.isEmpty()).toBe(true);
      });
    });
  });

  describe('Given the queue contains three items', () => {
    beforeEach(() => {
      testContext.spy1 = jest.fn();
      testContext.spy2 = jest.fn();
      testContext.spy3 = jest.fn();
      testContext.action1 = (cb) => {
        testContext.spy1();
        setTimeout(cb, 1);
      };
      testContext.action2 = (cb) => {
        testContext.spy2();
        setTimeout(cb, 100);
      };
      testContext.action3 = () => testContext.spy3();
      testContext.queue.pause();
      testContext.queue.push({
        action: testContext.action1,
      });
      testContext.queue.push({
        action: testContext.action2,
      });
      testContext.queue.push({
        action: testContext.action3,
        isSync: true,
      });
    });
    describe('immediately after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(0);
      });
      test('should start executing the first item', () => {
        expect(testContext.spy1).toHaveBeenCalled();
      });
      test('should not yet execute the second item', () => {
        expect(testContext.spy2).not.toHaveBeenCalled();
      });
    });
    describe('shortly after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(1);
      });
      test('should start executing the second item', () => {
        expect(testContext.spy2).toHaveBeenCalled();
      });
      test('should not yet execute the third item', () => {
        expect(testContext.spy3).not.toHaveBeenCalled();
      });
    });
    describe('some time after queue.resume()', () => {
      beforeEach(() => {
        testContext.queue.resume();
        jest.advanceTimersByTime(102);
      });
      test('should execute the third item', () => {
        expect(testContext.spy3).toHaveBeenCalled();
      });
      test('should become empty', () => {
        expect(testContext.queue.isEmpty()).toBe(true);
      });
    });
  });
});
