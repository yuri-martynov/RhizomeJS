﻿(function () {
    'use strict';

    var module = angular.module('rhizome', []);

    module.directive('rhAutomaton', rhAutomaton);
    module.directive('rhState', rhState);
    module.directive('rhRule', rhRule);
    module.directive('rhEdge', rhEdge);
    module.directive('rhEdges', rhEdges);
    module.directive('rhEvent', rhEvent);


    var transcludeTemplate = '<div ng-transclude></div>';

    function rhAutomaton() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            transclude: true,
            template: transcludeTemplate,

            link: {
                post: postLink,
            },
            controller: controller,
            scope: {
                plant: '=',
            },
        };
        return directive;

        function postLink(scope) {
            scope.automaton.start();
        }

        function controller($scope) {
            var automaton = $scope.automaton = new Automaton($scope.plant);

            this.addState = function(id, state) { automaton.addState(id, state); }
            this.addEdge = function (source, event, targetOrDelegate) { automaton.addEdge(source, event, targetOrDelegate); }
        }
    }

    function rhState() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            require: '^rhAutomaton',
            transclude: true,
            template: transcludeTemplate,

            link: {
                pre: preLink
            },
            controller: controller,
            scope: {
                id: '@',
            }
        };
        return directive;

        function preLink(scope, element, attrs, rhAutomatonCtrl) {
            var state = scope.state = new ActiveState();
            rhAutomatonCtrl.addState(scope.id, state);
        }

        function controller($scope) {
            this.addRuleFactory = function (ruleFactory) {
                $scope.state.addRuleFactory(ruleFactory);
            }
        }
    };

    function rhRule() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            require: '^rhState',

            link: link,
            scope: {
                factory: '&'
            }
        };
        return directive;

        function link(scope, element, attrs, rhStateCtrl) {
            rhStateCtrl.addRuleFactory(scope.factory());
        }
    };

    function rhEdges() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            require: '^rhAutomaton',
            transclude: true,
            template: transcludeTemplate,

            controller: controller,
            link: { pre: preLink },
            scope: {
                source: '@'
            }
        };
        return directive;

        function preLink(scope, element, attrs, rhAutomatonCtrl) {
            scope.automaton = rhAutomatonCtrl;
        }

        function controller($scope) {

            this.addEdge = function(event, delegateOrTarget) {
                $scope.automaton.addEdge($scope.source, event, delegateOrTarget);
            }

        }
    };

    function rhEdge() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            require: '^rhAutomaton',

            link: link,
            scope: {
                source: '@',
                event: '@',
                target: '@',
                delegate: '&'
            }
        };
        return directive;

        function link(scope, element, attrs, rhAutomatonCtrl) {
            rhAutomatonCtrl.addEdge(scope.source, scope.event, scope.target || scope.delegate());
        }
    };

    function rhEvent() {
        // Usage:
        // 
        // Creates:
        // 
        var directive = {
            restrict: 'E',
            require: '^rhEdges',

            link: link,
            scope: {
                event: '@',
                target: '@',
                delegate: '&'
            }
        };
        return directive;

        function link(scope, element, attrs, rhEdgesCtrl) {
            rhEdgesCtrl.addEdge(scope.event, scope.target || scope.delegate());
        }
    }

})();