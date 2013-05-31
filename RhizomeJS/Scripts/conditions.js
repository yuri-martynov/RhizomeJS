function Conditions() {

}

Conditions.Any = function () {
    var states = arguments;

    if (states.length == 0)
        throw "no target state(s) in arguments";

    if (states.length == 1) {
        return function () { return states[0]; };
    }

    return function () {
        var i = Math.floor((Math.random() * states.length - 1) + 1);
        return states[i];
    };
};