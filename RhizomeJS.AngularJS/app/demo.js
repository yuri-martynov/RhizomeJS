(function () {
    'use strict';

    angular.module('app', ['rhizome']).controller('DemoCtrl', ['$scope', demoCtrl]);

    function demoCtrl($scope) {
        var vm = this;

        vm.plant = { name: "Plant" };

        vm.rule1Factory = function(ctx) {
            var rule = {
                i: 1,
                plant: ctx.plant,
                eventSink: ctx.eventSink,

                step: function(host) {
                    console.log("ao 1: step " + this.i);
                    this.i++;

                    if (this.i > 14) {
                        this.eventSink.castEvent("e1");
                        return;
                    }

                    if (this.i % 4 == 1)
                        host.sleep(888);
                }
            };

            ctx.addActiveObject(rule);

            return rule;
        };

        vm.rule2Factory = function (ctx) {
            var rule = {
                i: 1,
                plant: ctx.plant,
                eventSink: ctx.eventSink,

                step: function (host) {
                    console.log("ao 2: step " + this.i);
                    this.i++;

                    if (this.i > 8) {
                        this.eventSink.castEvent("e2");
                        return;
                    }

                    if (this.i % 3 == 1)
                        host.sleep(250);
                }
            };
            ctx.addActiveObject(rule);
            return rule;
        };

    }
})();
