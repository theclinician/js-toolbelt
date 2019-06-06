/* eslint-env jest */

import { debounce, debounceKey } from './debounce.js';

jest.useFakeTimers();

describe('Test Debounce', () => {
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
    testContext.debounce = debounce(testContext.spy1, { ms: 100 });
    testContext.debounceKey = debounceKey(testContext.spy2, { ms: 200 });
  });

  describe('Given I call a debounced function three times', () => {
    beforeEach(() => {
      testContext.debounce('1', '2');
      testContext.debounce('3', '4');
      testContext.debounce('5', '6');
    });

    describe('and I check results immediately', () => {
      test('should not call the function yet', () => {
        expect(testContext.spy1).not.toHaveBeenCalled();
      });
    });

    describe('and I wait 100 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(100);
      });
      test('should call function exactly once', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(1);
      });
      test('should ignore the first call', () => {
        expect(testContext.spy1).not.toHaveBeenCalledWith('1', '2');
      });
      test('should ignore the second call', () => {
        expect(testContext.spy1).not.toHaveBeenCalledWith('3', '4');
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy1).toHaveBeenCalledWith('5', '6');
      });
    });
  });

  describe('Given I call a (key) debounced function four times with two different keys', () => {
    beforeEach(() => {
      testContext.debounceKey('A', '1', '2');
      testContext.debounceKey('A', '3', '4');
      testContext.debounceKey('A', '5', '6');
      testContext.debounceKey('B', '7', '8');
    });

    describe('and I check results immediately', () => {
      test('should not call the function yet', () => {
        expect(testContext.spy2).not.toHaveBeenCalled();
      });
    });

    describe('and I wait 200 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(200);
      });
      test('should call function exactly two times', () => {
        expect(testContext.spy2).toHaveBeenCalledTimes(2);
      });
      test('should ignore the first call', () => {
        expect(testContext.spy2).not.toHaveBeenCalledWith('A', '1', '2');
      });
      test('should ignore the second call', () => {
        expect(testContext.spy2).not.toHaveBeenCalledWith('A', '3', '4');
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy2).toHaveBeenCalledWith('A', '5', '6');
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy2).toHaveBeenCalledWith('B', '7', '8');
      });
    });
  });

  describe('Given I call a debounced function four times with small delay', () => {
    beforeEach(() => {
      testContext.debounce('1', '2');
      jest.advanceTimersByTime(40);
      testContext.debounce('3', '4');
      jest.advanceTimersByTime(40);
      testContext.debounce('5', '6');
      jest.advanceTimersByTime(40);
      testContext.debounce('7', '8');
    });

    describe('and I check results immediately', () => {
      test('should not call the function yet', () => {
        expect(testContext.spy1).not.toHaveBeenCalled();
      });
    });

    describe('and I check results after another 100 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(100);
      });

      test('should call function, but only once', () => {
        expect(testContext.spy1).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Given I have a recursive function which I want to debounce', () => {
    beforeEach(() => {
      testContext.spy3 = jest.fn();
      testContext.recursive = debounce((count) => {
        if (count > 0) {
          testContext.recursive(count - 1);
        }
        testContext.spy3(count);
      }, { ms: 10 });
      //-----------------------
      testContext.recursive(2);
    });

    describe('and I check immediately', () => {
      test('should not call the function yet', () => {
        expect(testContext.spy3).not.toHaveBeenCalled();
      });
    });

    describe('and I check after another 10 ms', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(10);
      });

      test('should call function once', () => {
        expect(testContext.spy3).toHaveBeenCalledTimes(1);
      });
      test('should call function with proper arguments', () => {
        expect(testContext.spy3).toHaveBeenCalledWith(2);
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
        expect(testContext.spy3).toHaveBeenNthCalledWith(1, 2);
        expect(testContext.spy3).toHaveBeenNthCalledWith(2, 1);
        expect(testContext.spy3).toHaveBeenNthCalledWith(3, 0);
      });
    });
  });
});
