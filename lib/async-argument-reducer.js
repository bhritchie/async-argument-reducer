"use strict";

module.exports = function (callback, reducer) {
    var wait = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var resolve = void 0;
    var p = new Promise(function (r) {
        return resolve = r;
    });
    var argCollection = [];
    var active = false;

    var startTimer = function startTimer() {
        setTimeout(function () {
            resolve(callback(reducer ? reducer([].concat(argCollection)) : [].concat(argCollection)));
            p = new Promise(function (r) {
                return resolve = r;
            });
            argCollection.length = 0;
            active = false;
        }, wait);
    };

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        argCollection.push(args);
        if (!active) {
            startTimer();
            active = true;
        }
        return p;
    };
};