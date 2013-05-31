function Conditions() {

}

Conditions.Any = function () {
    var states = arguments;

    if (states.length == 0)
        throw "no target state(s) in arguments";

    if (states.length == 1) {
        return states[0];
    }

    return function () {
        var i = Math.floor((Math.random() * states.length - 1) + 1);
        return states[i];
    };
};

Conditions.Row = function() {
    var states = arguments;

    if (states.length == 0)
        throw "no target state(s) in arguments";

    if (states.length == 1) {
        return states[0];
    }

    function row() {
        var index = 0;

        this.transition = function () {
            var oldIndex = index;
            index = (index + 1) % states.length;
            return states[oldIndex];
        };
    };

    return new row().transition;
}