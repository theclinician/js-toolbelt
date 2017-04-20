/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import Queue from './Queue.js';

chai.should();
chai.use(sinonChai);

describe('Test Queue', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers();
    this.queue = new Queue({
      onError: (error) => {
        throw error;
      },
    });
  });

  afterEach(function () {
    this.clock.restore();
  });

  describe('Given the queue is empty', function () {
    it('should recognize that it is empty', function () {
      this.queue.isEmpty().should.be.true;
    });
  });

  describe('Given the queue contains one item', function () {
    beforeEach(function () {
      this.action = sinon.spy();
      this.queue.pause();
      this.queue.push({
        action: this.action,
        isSync: true,
      });
    });
    describe('unless resume is called', function () {
      it('should recognize that it is not empty', function () {
        this.queue.isEmpty().should.be.false;
      });
    });
    describe('after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick();
      });
      it('should call execute action', function () {
        this.action.should.be.called;
      });
      it('should become empty', function () {
        this.queue.isEmpty().should.be.true;
      });
    });
  });

  describe('Given the queue contains one asynchronous', function () {
    beforeEach(function () {
      this.spy = sinon.spy();
      this.params = {};
      this.action = (params, cb) => {
        setTimeout(() => {
          this.spy(params);
          cb();
        }, 100);
      };
      this.queue.pause();
      this.queue.push({
        params: [this.params],
        action: this.action,
      });
    });
    describe('immediately after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick();
      });
      it('should not execute action yet', function () {
        this.spy.should.not.be.called;
      });
      it('should be empty', function () {
        this.queue.isEmpty().should.be.true;
      });
    });
    describe('some time after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick(100);
      });
      it('should execute action', function () {
        this.spy.should.be.calledWith(this.params);
      });
      it('should be empty', function () {
        this.queue.isEmpty().should.be.true;
      });
    });
  });

  describe('Given the queue contains three items', function () {
    beforeEach(function () {
      this.spy1 = sinon.spy();
      this.spy2 = sinon.spy();
      this.spy3 = sinon.spy();
      this.action1 = () => this.spy1();
      this.action2 = (cb) => {
        this.spy2();
        setTimeout(cb, 100);
      };
      this.action3 = () => this.spy3();
      this.queue.pause();
      this.queue.push({
        action: this.action1,
        isSync: true,
      });
      this.queue.push({
        action: this.action2,
      });
      this.queue.push({
        action: this.action3,
        isSync: true,
      });
    });
    describe('immediately after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick();
      });
      it('should start executing the first item', function () {
        this.spy1.should.be.called;
      });
      it('should not yet execute the second item', function () {
        this.spy2.should.not.be.called;
      });
    });
    describe('shortly after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick(1);
      });
      it('should start executing the second item', function () {
        this.spy2.should.be.called;
      });
      it('should not yet execute the third item', function () {
        this.spy3.should.not.be.called;
      });
    });
    describe('some time after queue.resume()', function () {
      beforeEach(function () {
        this.queue.resume();
        this.clock.tick(102);
      });
      it('should execute the third item', function () {
        this.spy3.should.be.called;
      });
      it('should become empty', function () {
        this.queue.isEmpty().should.be.true;
      });
    });
  });
});
