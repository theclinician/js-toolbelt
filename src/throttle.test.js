/* eslint-env mocha */
/* eslint prefer-arrow-callback: "off" */
/* eslint no-unused-expressions: "off" */

import sinon from 'sinon';
import { throttle, throttleKey } from './throttle.js';

describe('Test Throttle', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers();
    this.spy1 = sinon.spy();
    this.spy2 = sinon.spy();
    this.throttle = throttle(this.spy1, { ms: 100 });
    this.throttleKey = throttleKey(this.spy2, { ms: 200 });
  });

  afterEach(function () {
    this.clock.restore();
  });

  describe('Given I call a throttled function three times', function () {
    beforeEach(function () {
      this.throttle('1', '2');
      this.throttle('3', '4');
      this.throttle('5', '6');
    });

    describe('and I check results immediately', function () {
      it('should call function exactly once', function () {
        this.spy1.should.be.calledOnce;
      });
      it('should call function with proper arguments', function () {
        this.spy1.should.be.calledWith('1', '2');
      });
    });

    describe('and I wait 100 ms', function () {
      beforeEach(function () {
        this.clock.tick(100);
      });
      it('should call function exactly once', function () {
        this.spy1.should.be.calledTwice;
      });
      it('should ignore the middle call', function () {
        this.spy1.should.not.be.calledWith('3', '4');
      });
      it('should call function with proper arguments', function () {
        this.spy1.should.be.calledWith('5', '6');
      });
    });
  });

  describe('Given I call a (key) throttled function four times with two different keys', function () {
    beforeEach(function () {
      this.throttleKey('A', '1', '2');
      this.throttleKey('A', '3', '4');
      this.throttleKey('A', '5', '6');
      this.throttleKey('B', '7', '8');
    });

    describe('and I check results immediately', function () {
      it('should call function twice', function () {
        this.spy2.should.be.calledTwice;
      });
      it('should call function with proper arguments', function () {
        this.spy2.should.be.calledWith('A', '1', '2');
        this.spy2.should.be.calledWith('B', '7', '8');
      });
    });

    describe('and I wait 200 ms', function () {
      beforeEach(function () {
        this.clock.tick(200);
      });
      it('should call function exactly three times', function () {
        this.spy2.should.be.calledThrice;
      });
      it('should ignore the middle call', function () {
        this.spy2.should.not.be.calledWith('A', '3', '4');
      });
      it('should call function with proper arguments', function () {
        this.spy2.should.be.calledWith('A', '5', '6');
      });
    });
  });

  describe('Given I call a throttled function four times with small delay', function () {
    beforeEach(function () {
      this.throttle('1', '2');
      this.clock.tick(40);
      this.throttle('3', '4');
      this.clock.tick(40);
      this.throttle('5', '6');
      this.clock.tick(40);
      this.throttle('7', '8');
    });

    describe('and I check results immediately', function () {
      it('should call function exactly once', function () {
        this.spy1.should.be.calledTwice;
      });
      it('should call function with proper arguments', function () {
        this.spy1.should.be.calledWith('1', '2');
        this.spy1.should.be.calledWith('5', '6');
      });
    });

    describe('and I check results after another 80 ms', function () {
      beforeEach(function () {
        this.clock.tick(80);
      });

      it('should call function exactly 3 times', function () {
        this.spy1.should.be.calledThrice;
      });
      it('should call function with proper arguments', function () {
        this.spy1.should.be.calledWith('1', '2');
        this.spy1.should.be.calledWith('5', '6');
        this.spy1.should.be.calledWith('7', '8');
      });
    });
  });

  describe('Given I have a recursive function which I want to throttle', function () {
    beforeEach(function () {
      this.spy3 = sinon.spy();
      this.recursive = throttle((count) => {
        if (count > 0) {
          this.recursive(count - 1);
        }
        this.spy3(count);
      }, { ms: 10 });
      //----------------
      this.recursive(2);
    });

    describe('and I check immediately', function () {
      it('should be called exactly once', function () {
        this.spy3.should.be.calledOnce;
      });
      it('should call function with proper arguments', function () {
        this.spy3.should.be.calledWith(2);
      });
    });

    describe('and I check after another 10 ms', function () {
      beforeEach(function () {
        this.clock.tick(10);
      });

      it('should call function exactly twice', function () {
        this.spy3.should.be.calledTwice;
      });
      it('should call function with proper arguments', function () {
        this.spy3.should.be.calledWith(2);
        this.spy3.should.be.calledWith(1);
      });
    });

    describe('and I check after another 30 ms', function () {
      beforeEach(function () {
        this.clock.tick(30);
      });

      it('should call function exactly 3 times', function () {
        this.spy3.should.be.calledThrice;
      });
      it('should call function with proper arguments', function () {
        this.spy3.should.be.calledWith(2);
        this.spy3.should.be.calledWith(1);
        this.spy3.should.be.calledWith(0);
      });
    });
  });
});

