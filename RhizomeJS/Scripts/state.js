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

    this.enter = function(instance, ctx) {
        instance = instance || self;
        ctx = ctx || {};
        ctx.eventSink = instance.eventSink;
        ctx.plant = instance.plant;

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
    var self = this;

    var context = function() {
        var activeObjectHost = null;

        this.activeObjectHost = function() {
            return activeObjectHost || (activeObjectHost = new ActiveObjectHost());
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

    var enter = this.enter;
    this.enter = function() {
        enter(self, ctx);
        ctx.run();
    };

    var exit = this.exit;
    this.exit = function() {
        exit();
        ctx.stop();
    };
}

ActiveState.prototype = new CompositeState();