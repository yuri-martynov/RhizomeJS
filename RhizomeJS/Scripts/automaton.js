﻿function Automaton(plantObj) {
    var instance = this;
    var states = [];
    var edges = [];
    var currentState = null;
    var plant = plantObj || {};

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

    function edge(sourceState) {
        this.source = sourceState;

        var transitions = [];
        this.addTransition = function(t) {
            transitions.push(t);
        };

        this.getTargetState = function(event) {
            for (var i = 0; i < transitions.length; i++) {
                var target = transitions[i].getTargetState(event);
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
        return currentState == null ? null : currentState.id;
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

        var e = findEdgeBySourceState(sourceState);
        if (e == null) {
            console.error("castEvent: edge not found for state %s", sourceState);
            return;
        }

        var targetState = e.getTargetState(event);
        if (targetState == null) {
            console.error("castEvent: transition not found %s + %s -> ?", sourceState, event);
            return;
        }
        
        console.info("castEvent: %s + %s -> %s", sourceState, event, targetState);
        instance._setState(targetState);
    };
    
    function findEdgeBySourceState(source) {
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            if (e.source == source) return e;
        }
        return null;
    }

    this.addState = function(id, stateObj) {
        // todo: check for unique id
        var eventSink = {
            castEvent: function(event) {
                castEvent(id, event);
            }
        };

        stateObj.eventSink = eventSink;
        stateObj.plant = plant;
        states.push(new state(id, stateObj));
    };

    this._transitionFactory = function (event, targetState) {
        return new transition(event, targetState);
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

    this._setState = function(id) {
        var currentStateId = this.getStateId();
        if (currentStateId != null)
            prevStates.push(currentStateId);

        baseSetState(id);
    };

    StackAutomaton.PrevState = "StackAutomaton.PrevState." + new Date().getTime();
    
    function backTransition(event) {

        this.getTargetState = function (e) {
            if (e != event) return null;

            var l = prevStates.length;
            if (l == 0) {
                console.error("backTransition.getTargetState: no prev state");
                return null;
            }

            var prevIndex = l - 1;
            var prevStateId = prevStates[prevIndex];
            prevStates.splice(prevIndex, 1); // todo: statefull ???

            return prevStateId;
        };
    }
    
    var baseTransitionFactory = this._transitionFactory;
    this._transitionFactory = function (event, targetState) {
        if (targetState === StackAutomaton.PrevState) {
            return new backTransition(event);
        }
        else
            return baseTransitionFactory(event, targetState);
    };
}