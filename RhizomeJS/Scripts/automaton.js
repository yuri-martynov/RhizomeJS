function Automaton(plantObj) {
    var states = [];
    var edges = [];
    var currentState = null;
    var plant = plantObj;

    function state(id, stateObj) {
        this.id = id;
        this.stateObj = stateObj;
    }

    function edge(sourceState, event, targetState) {

        this.getTargetState = function(s, e) {
            return s == sourceState && e == event ? targetState : null;
        };
    }

    function getStateById(id) {
        for (var i in states) {
            var s = states[i];
            if (s.id == id) return s;
        }

        return null;
    }

    var setState = function(id) {
        if (currentState != null) {
            var exit = currentState.stateObj.exit;
            if (exit != undefined) exit();
        }

        currentState = getStateById(id);
        
        if (currentState != null) {
            var enter = currentState.stateObj.enter;
            if (enter != undefined) enter();
        }
    };

    this.setState = function(id) {
        setState(id);
    };

    this.state = function() {
        return currentState.stateObj;
    };

    this.stateId = function() {
        return currentState.id;
    };

    function castEvent(sourceState, event) {
        if (currentState == null) {
            console.error("current state is undefined");
            return;
        }

        if (sourceState != currentState.id) {
            console.warn("eventSource = " + sourceState + ", current state = " + currentState.id);
            return;
        }

        for (var i in edges) {
            var targetState = edges[i].getTargetState(sourceState, event);
            if (targetState != null) {
                console.info("before setState: %s + %s -> %s", sourceState, event, targetState);
                setState(targetState);
                return;
            }
        }
    }

    ;

    this.addState = function(id, stateObj) {

        var eventSink = {
            castEvent: function(event) {
                castEvent(id, event);
            }
        };

        stateObj.eventSink = eventSink;
        stateObj.plant = plant;
        states.push(new state(id, stateObj));
    };

    this.addEdge = function(sourceState, event, targetState) {
        edges.push(new edge(sourceState, event, targetState));
    };


}

function State() {
    this.eventSink = undefined;
    this.plant = undefined;
}