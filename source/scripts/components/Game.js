var Phlux = require("<scripts>/utilities/Phlux")
var LoopListenerMixin = require("<scripts>/utilities/LoopListenerMixin")
var KeyboardListenerMixin = require("<scripts>/utilities/KeyboardListenerMixin")

var GameFrame = require("<scripts>/components/GameFrame")
var Zoom = require("<scripts>/components/Zoom")
var Camera = require("<scripts>/components/Camera")
var Dungeon = require("<scripts>/components/Dungeon")
var Entity = require("<scripts>/components/Entity")

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

var MonsterData = {
    demon: {
        character: "&",
        color: "#339"
    }
}

var MonsterStore = Phlux.createStore({
    initiateStore: function() {
        //this.addMonster(MonsterData.demon, {x: 2, y: 2})
        this.addMonster(MonsterData.demon, {x: 5, y: 2})
    },
    addMonster: function(protomonster, position) {
        if(this.index === undefined) {
            this.index = 0
        }
        this.data[this.index] = {
            "position": position,
            "color": protomonster.color,
            "character": protomonster.character
        }
        this.index += 1
    },
    onMoveAdventurer: function(adventurer) {
        for(var key in this.data) {
            var monster = this.data[key]
            if(this.isInLineOfSight(monster.position, adventurer.position)) {
                monster.target_position = {
                    "x": adventurer.position.x,
                    "y": adventurer.position.y
                }
            }
            if(monster.target_position) {
                if(Math.abs(monster.position.x - monster.target_position.x) > 0
                && monster.position.x < monster.target_position.x
                && DungeonStore.getTile(monster.position.x + 1, monster.position.y).value === 1) {
                    monster.position.x += 1
                } else if(Math.abs(monster.position.x - monster.target_position.x) > 0
                && monster.position.x > monster.target_position.x
                && DungeonStore.getTile(monster.position.x - 1, monster.position.y).value === 1) {
                    monster.position.x -= 1
                } else if(Math.abs(monster.position.y - monster.target_position.y) > 0
                && monster.position.y > monster.target_position.y
                && DungeonStore.getTile(monster.position.x, monster.position.y - 1).value === 1) {
                    monster.position.y -= 1
                } else if(Math.abs(monster.position.y - monster.target_position.y) > 0
                && monster.position.y < monster.target_position.y
                && DungeonStore.getTile(monster.position.x, monster.position.y + 1).value === 1) {
                    monster.position.y += 1
                }
                if(monster.position.x == monster.target_position.x
                && monster.position.y == monster.target_position.y) {
                    delete monster.target_position
                }
            }
            monster.los = this.getPointsInLine(monster.position, adventurer.position)
            this.trigger()
        }
    },
    isInLineOfSight: function(alpha, omega) {
        var points = this.getPointsInLine(alpha, omega)
        for(var index in points) {
            var point = points[index]
            if(DungeonStore.getTile(point.x, point.y).value !== 1) {
                return false
            }
        }
        return true
    },
    getPointsInLine: function(alpha, omega) {
        var x = omega.x - alpha.x
        var y = omega.y - alpha.y
        var points = new Array()
        if(Math.abs(x) >= Math.abs(y)) {
            if(x > 0) {
                for(var lx = 0, ly = 0; lx <= x; lx++, ly += y / x) {
                    points.push({
                        "x": alpha.x + Math.floor(lx),
                        "y": alpha.y + Math.floor(ly)
                    })
                }
            } else if(x < 0) {
                for(var lx = 0, ly = 0; lx >= x; lx--, ly -= y / x) {
                    points.push({
                        "x": alpha.x + Math.floor(lx),
                        "y": alpha.y + Math.floor(ly)
                    })
                }
            }
        } else {
            if(y > 0) {
                for(var lx = 0, ly = 0; ly <= y; ly++, lx += x / y) {
                    points.push({
                        "x": alpha.x + Math.floor(lx),
                        "y": alpha.y + Math.floor(ly)
                    })
                }
            } else if(y < 0) {
                for(var lx = 0, ly = 0; ly >= y; ly--, lx -= x / y) {
                    points.push({
                        "x": alpha.x + Math.floor(lx),
                        "y": alpha.y + Math.floor(ly)
                    })
                }
            }
        }
        return points
    }
})

var AdventurerStore = Phlux.createStore({
    data: {
        position: {
            x: 9,
            y: 9
        },
        color: "#EEE",
        character: "@"
    },
    onKeyW: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1).value === 1) {
            this.data.position.y -= 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyS: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1).value === 1) {
            this.data.position.y += 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyA: function() {
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y).value === 1) {
            this.data.position.x -= 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyD: function() {
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y).value === 1) {
            this.data.position.x += 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    }
})

var Game = React.createClass({
    mixins: [
        LoopListenerMixin,
        KeyboardListenerMixin,
        Phlux.connectStore(DungeonStore, "dungeon"),
        Phlux.connectStore(MonsterStore, "monsters"),
        Phlux.connectStore(AdventurerStore, "adventurer")
    ],
    render: function() {
        return (
            <GameFrame>
                <Camera target={this.state.adventurer}>
                    <Dungeon data={this.state.dungeon}/>
                    <Entity data={this.state.adventurer}/>
                    {this.renderEntities(this.state.monsters)}
                    <LineOfSight data={this.state.monsters[0].los}/>
                </Camera>
            </GameFrame>
        )
    },
    renderEntities: function(entities) {
        var renderings = []
        for(var key in entities) {
            var entity = entities[key]
            renderings.push(
                <Entity key={key}
                    data={entity}/>
            )
        }
        return renderings
    }
})

var LineOfSight = React.createClass({
    render: function() {
        var renderings = []
        for(var key in this.props.data) {
            var point = this.props.data[key]
            renderings.push(
                <div key={key} style={this.renderStyles(point)}/>
            )
        }
        return (
            <div>
                {renderings}
            </div>
        )
    },
    renderStyles: function(point) {
        return {
            width: "1em",
            height: "1em",
            opacity: "0.5",
            top: point.y + "em",
            left: point.x + "em",
            backgroundColor: "red",
            position: "absolute"
        }
    }
})

module.exports = Game
