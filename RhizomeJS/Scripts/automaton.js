function Automaton(plantObj) {
    var instance = this;
    var states = [];
    var edges = [];
    var currentState = null;
    var plant = plantObj || {};
    var eventSink = null;

    this.setPlant = function(value) { plant = value; };
    this.setEventSink = function(value) { eventSink = value; };

    this._setInstance = function(s) {
        instance = s;
    };

    function state(id, stateObj) {
        this.id = id;
        this.stateObj = stateObj;
    }

    function transition(event, targetState) {
        this.getTargetState = function(e) {
            return e == event ? targetState : null;
        };
    }

    function conditionalTransition(event, conditionFunc) {
        this.getTargetState = function(e, data) {
            return e == event ? conditionFunc(plant, data) : null;
        };
    }

    function edge(sourceState) {
        this.source = sourceState;

        var transitions = [];
        this.addTransition = function(t) {
            transitions.push(t);
        };

        this.getTargetState = function(event, data) {
            for (var i = 0; i < transitions.length; i++) {
                var target = transitions[i].getTargetState(event, data);
                if (target != null) return target;
            }
            return null;
        };
    }

    function getStateById(id) {
        for (var i = 0; i < states.length; i++) {
            var s = states[i];
            if (s.id == id) return s;
        }

        return null;
    }

    function enter() {
        if (currentState == null) return;

        var stateEnter = currentState.stateObj.enter;
        if (stateEnter != undefined) stateEnter();
    }

    function exit() {
        if (currentState == null) return;

        var stateExit = currentState.stateObj.exit;
        if (stateExit != undefined) stateExit();
    }

    this.exit = function() { exit(); };
    this.enter = function() { enter(); };

    function setState(id) {
        exit();
        currentState = getStateById(id);
        enter();
    }

    this._setState = function(id) {
        setState(id);
    };

    this.setInitState = function(id) {
        currentState = getStateById(id);
    };

    this.getState = function() {
        return currentState == null ? null : currentState.stateObj;
    };

    this.getStateId = function() {
        return currentState == null ? null : currentState.id;
    };

    function castEvent(sourceState, event, data) {
        if (currentState == null) {
            console.error("current state is undefined");
            return;
        }

        if (sourceState != currentState.id) {
            console.warn("eventSource = " + sourceState + ", current state = " + currentState.id);
            return;
        }

        var e = findEdgeBySourceState(sourceState);
        if (e == null) {
            console.error("castEvent: edge not found for state %s", sourceState);
            return;
        }

        var targetState = e.getTargetState(event, data);
        if (targetState == null) {
            console.error("castEvent: transition not found %s + %s -> ?", sourceState, event);
            return;
        }

        console.info("castEvent: %s + %s -> %s", sourceState, event, targetState);
        instance._setState(targetState);
    }

    function findEdgeBySourceState(source) {
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            if (e.source == source) return e;
        }
        return null;
    }

    this.addState = function(id, stateObj) {

        var setEventSink = stateObj.setEventSink;
        if (setEventSink) {
            var es = {
                castEvent: function(event, data) {
                    castEvent(id, event, data);
                }
            };
            setEventSink(es);
        }

        var setPlant = stateObj.setPlant;
        if (setPlant) setPlant(plant);

        states.push(new state(id, stateObj));
    };

    this._transitionFactory = function(event, targetOrDelegate) {
        return (targetOrDelegate instanceof Function)
            ? new conditionalTransition(event, targetOrDelegate)
            : new transition(event, targetOrDelegate);
    };

    this.addEdge = function(sourceState, event, targetState) {
        var e = findEdgeBySourceState(sourceState);
        if (e == null) {
            e = new edge(sourceState);
            edges.push(e);
        }
        var t = instance._transitionFactory(event, targetState);
        e.addTransition(t);
    };

}

function StackAutomaton() {

    Automaton.apply(this, arguments);
    this._setInstance(this);
    var baseSetState = this._setState;

    var prevStates = [];

    this._setState = function (id) {
        
        if (id == StackAutomaton.PrevState) {
            var lastIndex = prevStates.length - 1;
            id = prevStates[lastIndex];
            prevStates.splice(lastIndex, 1); 
        } else {
            var currentStateId = this.getStateId();
            if (currentStateId != null)
                prevStates.push(currentStateId);
        }

        baseSetState(id);
    };

    function backTransition(event) {

        this.getTargetState = function(e) {
            if (e != event) return null;

            if (prevStates.length == 0) {
                console.error("backTransition.getTargetState: no prev state");
                return null;
            }

            return StackAutomaton.PrevState;
        };
    }

    var baseTransitionFactory = this._transitionFactory;
    this._transitionFactory = function(event, targetState) {
        if (targetState === StackAutomaton.PrevState) {
            return new backTransition(event);
        } else
            return baseTransitionFactory(event, targetState);
    };
}

StackAutomaton.PrevState = "StackAutomaton.PrevState." + new Date().getTime();

function State() {
    var eventSink = null;
    var plant = null;

    this.setEventSink = function (value) { eventSink = value; };
    this.getEventSink = function () { return eventSink; };

    this.setPlant = function (value) { plant = value; };
    this.getPlant = function () { return plant; };
}