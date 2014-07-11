function Conditions() {

}

Conditions.Any = function() {
    var states = arguments;

    if (states.length == 0)
        throw new Error("no target state(s) in arguments");

    if (states.length == 1) {
        return states[0];
    }

    return function() {
        var i = Math.floor((Math.random() * states.length - 1) + 1);
        return states[i];
    };
};

Conditions.Row = function() {
    var states = arguments;

    if (states.length == 0)
        throw new Error("no target state(s) in arguments");

    if (states.length == 1) {
        return states[0];
    }

    function row() {
        var index = 0;

        this.transition = function() {
            var oldIndex = index;
            index = (index + 1) % states.length;
            return states[oldIndex];
        };
    }

    return new row().transition;
};

Conditions.Random = function() {
    var states = arguments;

    if (states.length == 0)
        throw new Error("no target state(s) in arguments");

    if (states.length == 1) {
        return states[0].state;
    }

    var sum = 0;
    for (var i = 0; i < states.length; i++) {
        sum += states[i].prob;
    }

    return function() {
        var rnd = Math.random() * sum;
        var s = 0;

        for (var j = 0; j < states.length; j++) {
            var state = states[j];
            s += state.prob;
            if (rnd <= s) return state.state;
        }

        throw Error("Conditions.Random internal error");
    };
};