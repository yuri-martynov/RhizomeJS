function CompositeState() {
    var self = this;
    this.eventSink = undefined;
    this.plant = undefined;

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

    this.enter = function(ctx) {
        ctx = ctx || {};
        ctx.eventSink = self.eventSink;
        ctx.plant = self.plant;

        for (var i = 0; i < rulesFactories.length; i++) {
            var rule = rulesFactories[i](ctx);
            rules.push(rule);
        }

        for (var j = 0; j < rules.length; j++) {
            var enter = rules[j].enter;
            if (enter != undefined) enter();
        }

    };

    this.exit = function() {

        for (var i = 0; i < rules.length; i++) {
            var exit = rules[i].exit;
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

    var ctx = new context(this.eventSink, this.plant);

    var baseEnter = this.enter;
    this.enter = function() {
        baseEnter(ctx);

        ctx.run();
    };

    var baseExit = this.exit;
    this.exit = function() {
        ctx.stop();

        baseExit();
    };
}