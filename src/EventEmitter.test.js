/* eslint-env mocha */
/* eslint prefer-arrow-callback: "off" */
/* eslint no-unused-expressions: "off" */

import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import EventEmitter from './EventEmitter.js';

chai.should();
chai.use(sinonChai);

describe('Test EventEmitter', function () {
  beforeEach(function () {
    this.emitter = new EventEmitter();
  });

  describe('Given a single listener is registered', function () {
    beforeEach(function () {
      this.spy1 = sinon.spy();
      this.stop = this.emitter.on('EVENT', this.spy1);
    });

    it('should be triggered when event is emitted', function () {
      const object = {};
      this.emitter.emit('EVENT', object);
      this.spy1.should.have.been.calledWith(object);
    });

    it('should not be triggered if other event is emitted', function () {
      const object = {};
      this.emitter.emit('__EVENT', object);
      this.spy1.should.have.not.been.called;
    });

    it('should be triggered multiple times', function () {
      const object = {};
      this.emitter.emit('EVENT', object);
      this.emitter.emit('EVENT', object);
      this.spy1.should.have.been.calledTwice;
    });

    it('should not be triggered if stopped on time', function () {
      this.stop();
      this.emitter.emit('EVENT');
      this.spy1.should.not.have.been.called;
    });
  });

  describe('Given a single once-time listener is registered', function () {
    beforeEach(function () {
      this.spy1 = sinon.spy();
      this.stop = this.emitter.once('EVENT', this.spy1);
    });

    it('should be triggered when event is emitted', function () {
      const object = {};
      this.emitter.emit('EVENT', object);
      this.spy1.should.have.been.calledWith(object);
    });

    it('should not be triggered if other event is emitted', function () {
      const object = {};
      this.emitter.emit('__EVENT', object);
      this.spy1.should.have.not.been.called;
    });

    it('should not be triggered multiple times', function () {
      const object = {};
      this.emitter.emit('EVENT', object);
      this.emitter.emit('EVENT', object);
      this.spy1.should.have.been.calledOnce;
    });

    it('should not be triggered if stopped on time', function () {
      this.stop();
      this.emitter.emit('EVENT');
      this.spy1.should.not.have.been.called;
    });
  });

  describe('Given a new listener is added in a callback', function () {
    beforeEach(function () {
      this.spy1 = sinon.spy();
      this.spy2 = sinon.spy();
      this.stop = this.emitter.once('EVENT', () => {
        this.spy1();
        this.emitter.once('EVENT', this.spy2);
      });
    });

    it('should be triggered when event is emitted', function () {
      this.emitter.emit('EVENT');
      this.spy1.should.have.been.calledOnce;
    });

    it('the other callback should not be triggered at first', function () {
      this.emitter.emit('EVENT');
      this.spy2.should.not.have.been.called;
    });

    it('the other callback should ne triggered after second emit', function () {
      this.emitter.emit('EVENT');
      this.emitter.emit('EVENT');
      this.spy1.should.have.been.calledOnce;
      this.spy2.should.have.been.calledOnce;
    });

    it('further calls should be idepmpotent', function () {
      this.emitter.emit('EVENT');
      this.emitter.emit('EVENT');
      this.emitter.emit('EVENT');
      this.spy1.should.have.been.calledOnce;
      this.spy2.should.have.been.calledOnce;
    });
  });
});
