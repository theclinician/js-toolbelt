/* eslint-env jest */
import { throttle, throttleKey } from './throttle.js';

jest.useFakeTimers();

describe('Test Throttle', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  beforeEach(() => {
    testContext.spy1 = jest.fn();
    testContext.spy2 = jest.fn();
    testContext.throttle = throttle(testContext.spy1, { ms: 100 });
    testContext.throttleKey = throttleKey(testContext.spy2, { ms: 200 });
  });

  describe('Given I call a throttled function three times', () => {
    beforeEach(() => {
      testContext.throttle('1', '2');
      testContext.throttle('3', '4');
      testContext.throttle('5', '6');
    });

    describe('and I check results immediately', () => {
      test('should call function exactly once', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(1);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy1).toHaveBeenCalledWith('1', '2');
      });
    });

    describe('and I wait 100 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(100);
      });
      test('should call function exactly once', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(2);
      });
      test('should ignore the middle call', () => {
        expect(testContext.spy1).not.toHaveBeenCalledWith('3', '4');
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy1).toHaveBeenCalledWith('5', '6');
      });
    });
  });

  describe('Given I call a (key) throttled function four times with two different keys', () => {
    beforeEach(() => {
      testContext.throttleKey('A', '1', '2');
      testContext.throttleKey('A', '3', '4');
      testContext.throttleKey('A', '5', '6');
      testContext.throttleKey('B', '7', '8');
    });

    describe('and I check results immediately', () => {
      test('should call function twice', () => {
        expect(testContext.spy2).toHaveBeenCalledTimes(2);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy2).toHaveBeenCalledWith('A', '1', '2');
        expect(testContext.spy2).toHaveBeenCalledWith('B', '7', '8');
      });
    });

    describe('and I wait 200 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(200);
      });
      test('should call function exactly three times', () => {
        expect(testContext.spy2).toHaveBeenCalledTimes(3);
      });
      test('should ignore the middle call', () => {
        expect(testContext.spy2).not.toHaveBeenCalledWith('A', '3', '4');
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy2).toHaveBeenCalledWith('A', '5', '6');
      });
    });
  });

  describe('Given I call a throttled function four times with small delay', () => {
    beforeEach(() => {
      testContext.throttle('1', '2');
      jest.advanceTimersByTime(40);
      testContext.throttle('3', '4');
      jest.advanceTimersByTime(40);
      testContext.throttle('5', '6');
      jest.advanceTimersByTime(40);
      testContext.throttle('7', '8');
    });

    describe('and I check results immediately', () => {
      test('should call function exactly once', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(2);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy1).toHaveBeenCalledWith('1', '2');
        expect(testContext.spy1).toHaveBeenCalledWith('5', '6');
      });
    });

    describe('and I check results after another 80 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(80);
      });

      test('should call function exactly 3 times', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(3);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy1).toHaveBeenCalledWith('1', '2');
        expect(testContext.spy1).toHaveBeenCalledWith('5', '6');
        expect(testContext.spy1).toHaveBeenCalledWith('7', '8');
      });
    });
  });

  describe('Given I have a recursive function which I want to throttle', () => {
    beforeEach(() => {
      testContext.spy3 = jest.fn();
      testContext.recursive = throttle((count) => {
        if (count > 0) {
          testContext.recursive(count - 1);
        }
        testContext.spy3(count);
      }, { ms: 10 });
      //----------------
      testContext.recursive(2);
    });

    describe('and I check immediately', () => {
      test('should be called exactly once', () => {
        expect(testContext.spy3).toHaveBeenCalledTimes(1);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy3).toHaveBeenCalledWith(2);
      });
    });

    describe('and I check after another 10 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(10);
      });

      test('should call function exactly twice', () => {
        expect(testContext.spy3).toHaveBeenCalledTimes(2);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy3).toHaveBeenCalledWith(2);
        expect(testContext.spy3).toHaveBeenCalledWith(1);
      });
    });

    describe('and I check after another 30 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(30);
      });

      test('should call function exactly 3 times', () => {
        expect(testContext.spy3).toHaveBeenCalledTimes(3);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy3).toHaveBeenCalledWith(2);
        expect(testContext.spy3).toHaveBeenCalledWith(1);
        expect(testContext.spy3).toHaveBeenCalledWith(0);
      });
    });
  });
});
