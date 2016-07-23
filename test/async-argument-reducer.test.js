'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiCounting = require('chai-counting');
const sinon = require('sinon');
chai.use(chaiCounting);
require('sinon-as-promised');

const wait = require('../lib/async-argument-reducer')

describe('async-argument-reducer', () => {
    let clock;
    let stub;
    let waitingStub;

    beforeEach(() => {
        stub = sinon.stub().resolves({});
        clock = sinon.useFakeTimers();
    });

    afterEach('Clean up spies and stubs', () => {
        stub.reset()
        clock.restore();
    });

    describe('a wait function created with a callback only', () => {

        beforeEach(() => {
            waitingStub = wait(stub);
        });

        it('should invoke the callback on next tick - single arguments', () => {
            waitingStub(1);
            waitingStub(2);
            waitingStub(3);

            stub.callCount.should.be.zero;

            clock.tick(0);
            stub.callCount.should.be.one;
            stub.args.length.should.be.one;
            stub.calledWith([[1], [2], [3]]).should.be.true;
        });

        it('should invoke the callback on next tick - multiple arguments', () => {
            waitingStub(1, 2);
            waitingStub(3, 4);
            waitingStub(5, 6);

            stub.callCount.should.be.zero;

            clock.tick(0);
            stub.callCount.should.be.one;
            stub.args.length.should.be.one;
            stub.calledWith([[1, 2], [3, 4], [5, 6]]).should.be.true;
        });

        it('should call handle multiple rounds of calls', () => {
            waitingStub(1);
            waitingStub(2);
            waitingStub(3);

            clock.tick(0);
            stub.callCount.should.be.one;
            stub.getCall(0).args.length.should.be.one;
            stub.getCall(0).args[0].should.deep.equal([[1], [2], [3]]);

            waitingStub('a');
            waitingStub('b');
            waitingStub('c');

            clock.tick(0);
            stub.callCount.should.be.two;
            stub.getCall(1).args.length.should.be.one;
            stub.getCall(1).args[0].should.deep.equal([['a'], ['b'], ['c']]);
        });

        it('should return a promise that resolves to the return value of the callback', () => {
            const r1 = waitingStub(1);
            expect(r1).to.be.an.instanceOf(Promise);

            clock.tick(0);

            return r1.then((value) => expect(value).to.deep.equal({}))
        });

        it('should return the same promise for each call in a group', () => {
            const r1 = waitingStub(1);
            const r2 = waitingStub(2);
            expect(r1).to.be.an.instanceOf(Promise);
            expect(r2).to.be.an.instanceOf(Promise);
            expect(r1).to.be.equal(r2);
        });

        it('should return a distinct promise for each round of calls', () => {
            const r1 = waitingStub(1);
            clock.tick(0)
            const r2 = waitingStub(2);
            expect(r1).to.be.an.instanceOf(Promise);
            expect(r2).to.be.an.instanceOf(Promise);
            expect(r1).not.to.be.equal(r2);
        });
    });

    describe('a wait function created with a callback and a reducer', () => {
        const funcs = {reducer: (args) => Array.prototype.concat(...args)}
        let reducerSpy;

        beforeEach(() => {
            reducerSpy = sinon.spy(funcs, 'reducer');
            waitingStub = wait(stub, funcs.reducer);
        });

        afterEach('Clean up spies and stubs', () => {
            reducerSpy.restore()
        });

        it('should invoke the callback with arguments processed by specified reducer', () => {
            waitingStub(1, 2);
            waitingStub(3, 4);
            waitingStub(5, 6);

            clock.tick(0);

            reducerSpy.callCount.should.be.one;
            reducerSpy.calledWith([[1, 2], [3, 4], [5, 6]]).should.be.true;

            stub.callCount.should.be.one;
            stub.args.length.should.be.one;
            stub.calledWith([1, 2, 3, 4, 5, 6]).should.be.true;
        });
    });

    describe('a wait function created with a callback and a delay', () => {
        const delay = 10;

        beforeEach(() => {
            waitingStub = wait(stub, null, delay);
        });

        it('should invoke the callback after the specified delay', () => {
            waitingStub(1);
            waitingStub(2);
            waitingStub(3);

            clock.tick(10);
            stub.callCount.should.be.one;
            stub.getCall(0).args.length.should.be.one;
            stub.getCall(0).args[0].should.deep.equal([[1], [2], [3]]);

            waitingStub('a');
            waitingStub('b');
            waitingStub('c');

            clock.tick(10);
            stub.callCount.should.be.two;
            stub.getCall(1).args.length.should.be.one;
            stub.getCall(1).args[0].should.deep.equal([['a'], ['b'], ['c']]);
        });
    });
});