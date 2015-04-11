var Phlux = require("<scripts>/utilities/Phlux")
var KeyboardListenerMixin = require("<scripts>/utilities/KeyboardListenerMixin")

var GameFrame = require("<scripts>/components/GameFrame")
var Dungeon = require("<scripts>/components/Dungeon")
var Adventurer = require("<scripts>/components/Adventurer")

var Level = require("<scripts>/references/level.json")

var DungeonStore = Phlux.createStore({
    data: {
        width: 20,
        height: 15,
        tiles: {}
    },
    initiateStore: function() {
        this.data.width = Level.width
        this.data.height = Level.height
        var tiles = Level.layers[0].data
        for(var x = 0; x < Level.width; x++) {
            for(var y = 0; y < Level.height; y++) {
                var tile = tiles[y * Level.width + x]
                this.data.tiles[x + "x" + y] = {
                    position: {
                        "x": x,
                        "y": y
                    },
                    "value": tile - 1
                }
            }
        }
    },
    getTile: function(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data.tiles[x + "x" + y]
    }
})

var AdventurerStore = Phlux.createStore({
    data: {
        position: {
            x: 10,
            y: 10
        }
    },
    onKeyW: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1).value === 1) {
            this.data.position.y -= 1
            this.trigger()
        }
    },
    onKeyS: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1).value === 1) {
            this.data.position.y += 1
            this.trigger()
        }
    },
    onKeyA: function() {
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y).value === 1) {
            this.data.position.x -= 1
            this.trigger()
        }
    },
    onKeyD: function() {
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y).value === 1) {
            this.data.position.x += 1
            this.trigger()
        }
    }
})

var Game = React.createClass({
    mixins: [
        KeyboardListenerMixin,
        Phlux.connectStore(DungeonStore, "dungeon"),
        Phlux.connectStore(AdventurerStore, "adventurer")
    ],
    render: function() {
        return (
            <GameFrame>
                <Camera target={this.state.adventurer}>
                    <Dungeon data={this.state.dungeon}/>
                    <Adventurer data={this.state.adventurer}/>
                </Camera>
            </GameFrame>
        )
    }
})

var Camera = React.createClass({
    propTypes: {
        target: React.PropTypes.shape({
            position: React.PropTypes.shape({
                x: React.PropTypes.number.isRequired,
                y: React.PropTypes.number.isRequired
            }).isRequired
        }).isRequired
    },
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.props.children}
            </div>
        )
    },
    renderStyles: function() {
        return {
            position: "absolute",
            top: (this.props.target.position.y - (HEIGHT / 2)) * -1 + "em",
            left: (this.props.target.position.x - (WIDTH / 2)) * -1 + "em",
            transitionProperty: "top left",
            transitionDuration: "0.25s"
        }
    }
})

module.exports = Game
