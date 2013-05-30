function Automaton(plantObj) {
    var instance = this;
    var states = [];
    var edges = [];
    var currentState = null;
    var plant = plantObj || {};
    
    this._setInstance = function (s) {
        instance = s;
    };
    
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
        for (var i = 0; i < states.length; i++) {
            var s = states[i];
            if (s.id == id) return s;
        }

        return null;
    }

    function setState(id) {
        if (currentState != null) {
            var exit = currentState.stateObj.exit;
            if (exit != undefined) exit();
        }

        currentState = getStateById(id);

        if (currentState != null) {
            var enter = currentState.stateObj.enter;
            if (enter != undefined) enter();
        }
    }

    this._setState = function(id) {
        setState(id);
    };

    this.setInitState = function(id) {
        setState(id);
    };

    this.getState = function() {
        return currentState == null ? null : currentState.stateObj;
    };

    this.getStateId = function() {
        return  currentState == null ? null : currentState.id;
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

        for (var i = 0; i < edges.length; i++) {
            var targetState = edges[i].getTargetState(sourceState, event);
            if (targetState != null) {
                console.info("castEvent: %s + %s -> %s", sourceState, event, targetState);
                instance._setState(targetState);
                return;
            }
        }
    };

    this.addState = function(id, stateObj, eventSink) {
        // todo: check for unique id
        eventSink = eventSink || {};
        eventSink.castEvent = function(event) {
            castEvent(id, event);
        };

        stateObj.eventSink = eventSink;
        stateObj.plant = plant;
        states.push(new state(id, stateObj));
    };

    this.addEdge = function (sourceState, event, targetState) {
        // todo: check for unique args
        edges.push(new edge(sourceState, event, targetState));
    };

}

function StackAutomaton() {
    Automaton.apply(this, arguments);
    this._setInstance(this);
    var self = this;
    var baseSetState = this._setState;

    var prevStates = [];

    var baseAddState = this.addState;
    this.addState = function(id, stateObj) {
        var eventSink = {
            goBack: function () {
                var l = prevStates.length;
                if (l == 0) {
                    console.error("goBack: no prev state");
                    return;
                }
                
                var prevIndex = l - 1;
                var prevStateId = prevStates[prevIndex];
                prevStates.splice(prevIndex, 1);
                
                console.info("goBack: %s -> %s", self.getStateId(), prevStateId);
                baseSetState(prevStateId);
            }
        };

        baseAddState(id, stateObj, eventSink);
    };

    this._setState = function (id) {
        var currentStateId = this.getStateId();
        if (currentStateId != null)
            prevStates.push(currentStateId);

        baseSetState(id);
    };
}