# async-argument-reducer

This package allows you to wrap a function so that it can be called several times but the execution will be delayed for some number of milliseconds (`0` by default) so as to aggregate arguments across calls. It's a bit like throttling or debouncing, except that you wind up with all of the arguments from each call.

The wrapper function returns a promise which resolves to the result of invoking your callback with the aggregated set of arguments. Each set of aggregated calls gets its own promise.

[![Build Status](https://travis-ci.org/bhritchie/async-argument-reducer.svg?branch=master)](https://travis-ci.org/bhritchie/async-argument-reducer) [![npm](https://img.shields.io/npm/dt/async-argument-reducer.svg)](https://www.npmjs.com/package/async-argument-reducer)

## Installation

    npm install async-argument-reducer

## Usage

    const wait = require('async-argument-reducer');

    const loggerOne = wait(console.log);

    loggerOne(1);
    loggerOne(2);
    loggerOne(3, 4);

    setTimeout(() => {
        loggerOne('a');
        loggerOne('b');
        loggerOne('c', 'd');
    }, 0);

    // =>
    // [[1], [2], [3, 4]]
    // [['a'], ['b'], ['c', 'd']]

As seen here, by default the arguments from each call are gathered up into an array and pushed onto a collecting array for the group of calls as a whole. You will probably want to specify some kind of aggregation for these arguments. In that case provide your own reducing function as the second paramater. For example:

    const loggerTwo = collector(console.log, (args) => Array.prototype.concat(...args))

    loggerTwo(1, 2);
    loggerTwo(3, 4);
    loggerTwo(5, 6);

    // =>
    // [1, 2, 3, 4, 5, 6]

You can also specify, as a third parameter, the number of milliseconds over which to aggregate arguments. By default this is `0` (i.e., just wait until the next tick).

    const loggerThree = collector(console.log, null, 10);

## License

[ISC](./LICENSE.txt).