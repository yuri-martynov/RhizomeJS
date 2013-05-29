function ActiveState() {
    var self = this;
    this.eventSink = undefined;
    this.plant = undefined;
    
    var rulesFactories = [];
    var rules = [];

    var context = function () {
        var activeObjectHost = null;

        this.activeObjectHost = function() {
            return activeObjectHost || (activeObjectHost = new ActiveObjectHost());
        };

        this.run = function() {
            if (activeObjectHost != null)
                activeObjectHost.run();
        };

        this.stop = function () {
            if (activeObjectHost != null) {
                activeObjectHost.stop();
                activeObjectHost = null;
            }
        };
    };

    var ctx = new context(this.eventSink, this.plant);

    var addRuleFactory = function (rule) {
        rulesFactories.push(rule);
    };

    this.addRuleFactory = function () {
        for (var i in arguments) {
            addRuleFactory(arguments[i]);
        }
    };

    this.enter = function() {
        for (var i in rulesFactories) {
            var rule = rulesFactories[i](ctx);
            rule.eventSink = self.eventSink;
            rule.plant = self.plant;

            rules.push(rule);
            
            var enter = rule.enter;
            if (enter != undefined) enter();
        }

        ctx.run();
    };

    this.exit = function () {

        for (var i in rules) {
            var exit = rules[i].exit;
            if (exit != undefined) exit();
        }

        rules = [];

        ctx.stop();
    };

}