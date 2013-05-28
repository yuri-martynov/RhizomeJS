activeObjectHost = {
    activeObjects: [],

    add: function(activeObject) {

        var host = {
            stop: function() {
                activeObject.$stopped = true;
            }.bind(this),

            sleep: function(msec) {
                activeObject.$wakeupTime = new Date(new Date().getTime() + msec);
            }
        };

        var wrapper = {
            step: function () {
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

        this.activeObjects.push(wrapper);
    }, // add

    run: function() {

        while (this.activeObjects.length > 0) {

            var resumeDate = undefined;
            for (var i in this.activeObjects) {
                var activeObject = this.activeObjects[i];

                var runAfter = activeObject.runAfter();
                if (runAfter <= 0) {
                    activeObject.step();
                } else {
                    var runDate = new Date(new Date().getTime() + runAfter);
                    if ((resumeDate == undefined) || (resumeDate > runDate))
                        resumeDate = runDate;
                }
            }

            for (var j = this.activeObjects.length - 1; j >= 0; j--) {
                if (this.activeObjects[j].isActive() == false)
                    this.activeObjects.splice(j, 1);
            }

            if (resumeDate != undefined) {
                var resumeAfter = resumeDate - new Date();
                if (resumeAfter > 0) {
                    setTimeout(function() { this.run(); }.bind(this), resumeAfter);
                    return;
                }
            }
        } // while
    } // run
}