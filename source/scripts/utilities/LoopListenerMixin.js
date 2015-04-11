var Loop = require("<scripts>/utilities/Loop")
var Phlux = require("<scripts>/utilities/Phlux")

var LoopListenerMixin = {
    componentDidMount: function() {
        Loop(function(tick) {
            Phlux.triggerAction("LoopTick", tick)
        })
    },
    componentWillUnmount: function() {
        //Unloop
    }
}

module.exports = LoopListenerMixin
