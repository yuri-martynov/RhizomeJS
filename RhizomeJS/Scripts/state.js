function CompositeState() {
    State.apply(this, arguments);

    var rulesFactories = [];
    var rules = [];

    var addRuleFactory = function(rule) {
        rulesFactories.push(rule);
    };

    this.addRuleFactory = function() {
        for (var i = 0; i < arguments.length; arguments++) {
            addRuleFactory(arguments[i]);
        }
    };

    this.onEntry = function(ctx) {
        ctx = ctx || {};
        ctx.eventSink = this.getEventSink();
        ctx.plant = this.getPlant();

        for (var i = 0; i < rulesFactories.length; i++) {
            var rule = rulesFactories[i](ctx);
            rules.push(rule);
        }

        for (var j = 0; j < rules.length; j++) {
            var enter = rules[j].onEntry;
            if (enter != undefined) enter();
        }

    }.bind(this);

    this.onExit = function() {

        for (var i = 0; i < rules.length; i++) {
            var exit = rules[i].onExit;
            if (exit != undefined) exit();
        }

        rules = [];
    };

}

function ActiveState() {
    CompositeState.apply(this, arguments);
    
    var context = function() {
        var activeObjectHost = null;

        var getActiveObjectHost = function() {
            return activeObjectHost || (activeObjectHost = new ActiveObjectHost());
        };

        this.addActiveObject = function(activeObject) {
            getActiveObjectHost().add(activeObject);
        };

        this.run = function() {
            if (activeObjectHost != null)
                activeObjectHost.run();
        };

        this.stop = function() {
            if (activeObjectHost != null) {
                activeObjectHost.stop();
                activeObjectHost = null;
            }
        };
    };

    var ctx = new context();

    var baseEnter = this.onEntry;
    this.onEntry = function() {
        baseEnter(ctx);

        ctx.run();
    };

    var baseExit = this.onExit;
    this.onExit = function() {
        ctx.stop();

        baseExit();
    };
}