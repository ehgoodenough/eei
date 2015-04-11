var vkey = require("vkey")
var Phlux = require("<scripts>/utilities/Phlux")

var KeyboardListenerMixin = {
    componentDidMount: function() {
        var keystrokes = {}
        document.addEventListener("keydown", function(event) {
            var key = vkey[event.keyCode]
            if(keystrokes[key] == undefined) {
                Phlux.triggerAction("Key" + key)
                keystrokes[key] = true
            }
        })
        document.addEventListener("keyup", function(event) {
            var key = vkey[event.keyCode]
            delete keystrokes[key]
        })
    }
}

module.exports = KeyboardListenerMixin
