module.exports = (callback, reducer, wait=0) => {
    let resolve;
    let p = new Promise(r => resolve = r);
    let argCollection = [];
    let active = false;

    const startTimer = () => {
        setTimeout(() => {
            resolve(callback(reducer ? reducer([...argCollection]) : [...argCollection]));
            p = new Promise((r) => resolve = r);
            argCollection.length = 0;
            active = false;
        }, wait);
    }

    return (...args) => {
        argCollection.push(args);
        if (!active) {
            startTimer();
            active = true;
        }
        return p;
    }
}