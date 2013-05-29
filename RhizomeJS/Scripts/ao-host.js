function ActiveObjectHost () {
    
    var activeObjects = [];

    var add = function(activeObject) {

        var host = {
            stop: function() {
                activeObject.$stopped = true;
            },

            sleep: function(msec) {
                activeObject.$wakeupTime = new Date(new Date().getTime() + msec);
            }
        };

        var wrapper = {
            step: function() {
                activeObject.$wakeupTime = undefined;
                activeObject.step(host);
            },

            runAfter: function() {
                var wakeupTime = activeObject.$wakeupTime;
                if (wakeupTime == undefined) return 0;
                return wakeupTime - new Date();
            },

            isActive: function() {
                return activeObject.$stopped == undefined;
            }
        };

        activeObjects.push(wrapper);
    }; // add

    this.add = function() {
        for (var i in arguments) {
            add(arguments[i]);
        }
    };

    var run = function() {

        while (activeObjects.length > 0) {

            var resumeDate = undefined;
            for (var i in activeObjects) {
                var activeObject = activeObjects[i];

                var runAfter = activeObject.runAfter();
                if (runAfter <= 0) {
                    activeObject.step();
                } else {
                    var runDate = new Date(new Date().getTime() + runAfter);
                    if ((resumeDate == undefined) || (resumeDate > runDate))
                        resumeDate = runDate;
                }
            }

            for (var j = activeObjects.length - 1; j >= 0; j--) {
                if (activeObjects[j].isActive() == false)
                    activeObjects.splice(j, 1);
            }

            if (resumeDate != undefined) {
                var resumeAfter = resumeDate - new Date();
                if (resumeAfter > 0) {
                    setTimeout(function() { run(); }.bind(this), resumeAfter);
                    return;
                }
            }
        } // while
    }; // run

    this.run = function() {
        run();
    };
}