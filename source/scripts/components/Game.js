var BinaryHeap = require("yabh")
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
                if(tile === 2) {
                    this.data.tiles[x + "x" + y] = {
                        position: {
                            "x": x,
                            "y": y
                        },
                        "value": tile - 1
                    }
                }
            }
        }
    },
    getTile: function(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data.tiles[x + "x" + y]
    },
    getTileNeighbors: function(point) {
        var tiles = []
        var northernTile = this.getTile(point.x, point.y - 1)
        if(northernTile !== undefined) {
            tiles.push(northernTile)
        }
        var southernTile = this.getTile(point.x, point.y + 1)
        if(southernTile !== undefined) {
            tiles.push(southernTile)
        }
        var westernTile = this.getTile(point.x - 1, point.y)
        if(westernTile !== undefined) {
            tiles.push(westernTile)
        }
        var easternTile = this.getTile(point.x + 1, point.y)
        if(easternTile !== undefined) {
            tiles.push(easternTile)
        }
        return tiles
    },
    getShortestPath: function(alpha_point, omega_point) {
        var path = new Array()
        var closed_points = new Object()
        var open_points = new BinaryHeap(function(point) {
            return point.score
        })
        var first_point = {
            "x": alpha_point.x,
            "y": alpha_point.y,
            "score": 0
        }
        closed_points[first_point.x + "x" + first_point.y] = first_point
        open_points.push(first_point)
        var heuristic = function(alpha_point, omega_point) {
            var x = Math.abs(alpha_point.x - omega_point.x)
            var y = Math.abs(alpha_point.y - omega_point.y)
            return x + y
        }
        while(open_points.size() > 0) {
            var current_point = open_points.pop()
            if(current_point.x == omega_point.x
            && current_point.y == omega_point.y) {
                path.unshift(current_point)
                break;
            }
            var neighboring_tiles = this.getTileNeighbors(current_point)
            for(var index in neighboring_tiles) {
                var tile = neighboring_tiles[index]
                var point = {
                    x: tile.position.x,
                    y: tile.position.y,
                    previous_point: current_point,
                    score: current_point.score + 1
                }
                point.score += heuristic(point, omega_point)
                var coords = point.x + "x" + point.y
                if(closed_points[coords] === undefined) {
                    closed_points[coords] = current_point
                    open_points.push(point)
                }
            }
        }
        if(path.length > 0) {
            while(path[0].previous_point !== undefined
            && path[0].previous_point.previous_point !== undefined) {
                var point = path[0].previous_point
                path.unshift(point)
            }
        }
        return path
    },
    isInLineOfSight: function(alpha, omega) {
        var points = this.getPointsInLine(alpha, omega)
        for(var index in points) {
            var point = points[index]
            if(this.getTile(point.x, point.y) == undefined) {
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
                        "x": alpha.x + Math.round(lx),
                        "y": alpha.y + Math.round(ly)
                    })
                }
            } else if(x < 0) {
                for(var lx = 0, ly = 0; lx >= x; lx--, ly -= y / x) {
                    points.push({
                        "x": alpha.x + Math.round(lx),
                        "y": alpha.y + Math.round(ly)
                    })
                }
            }
        } else {
            if(y > 0) {
                for(var lx = 0, ly = 0; ly <= y; ly++, lx += x / y) {
                    points.push({
                        "x": alpha.x + Math.round(lx),
                        "y": alpha.y + Math.round(ly)
                    })
                }
            } else if(y < 0) {
                for(var lx = 0, ly = 0; ly >= y; ly--, lx -= x / y) {
                    points.push({
                        "x": alpha.x + Math.round(lx),
                        "y": alpha.y + Math.round(ly)
                    })
                }
            }
        }
        return points
    }
})

var MonsterData = {
    demon: {
        character: "&",
        color: "#339"
    },
    dragon: {
        character: "$",
        color: "#C33"
    }
}

var MonsterStore = Phlux.createStore({
    initiateStore: function() {
        //this.addMonster(MonsterData.demon, {x: 2, y: 2})
        this.addMonster(MonsterData.dragon, {x: 2, y: 2})
    },
    addMonster: function(protomonster, position) {
        if(this.index === undefined) {
            this.index = 0
        }
        this.data[this.index] = {
            "emote": "idle",
            "position": position,
            "color": protomonster.color,
            "character": protomonster.character
        }
        this.index += 1
    },
    onMoveAdventurer: function(adventurer) {
        for(var key in this.data) {
            var monster = this.data[key]
            if(monster.emote) {
                if(monster.emote == "confused") {
                    monster.emote = "idle"
                }
                if(monster.emote == "alarmed") {
                    monster.emote = "angry"
                }
            }
            if(monster.target_position) {
                monster.path = DungeonStore.getShortestPath(monster.position, monster.target_position)
                monster.position.x = monster.path[0].x
                monster.position.y = monster.path[0].y
                if(monster.position.x == adventurer.position.x
                && monster.position.y == adventurer.position.y) {
                    console.log("bam you dead")
                }
                if(monster.position.x == monster.target_position.x
                && monster.position.y == monster.target_position.y) {
                    delete monster.target_position
                    monster.emote = "confused"
                }
            }
            if(DungeonStore.isInLineOfSight(monster.position, adventurer.position)) {
                if(monster.emote != "angry") {
                    monster.emote = "alarmed"
                }
                monster.target_position = {
                    "x": adventurer.position.x,
                    "y": adventurer.position.y
                }
            }
            monster.line_of_sight = DungeonStore.getPointsInLine(monster.position, adventurer.position)
            this.trigger()
        }
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
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1)) {
            this.data.position.y -= 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyS: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1)) {
            this.data.position.y += 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyA: function() {
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y)) {
            this.data.position.x -= 1
            this.trigger()
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyD: function() {
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y)) {
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
                    <Points data={this.state.monsters[0].path} color={"red"}/>
                    <Points data={this.state.monsters[0].line_of_sight} color={"yellow"}/>
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

var Points = React.createClass({
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
            opacity: "0.25",
            top: point.y + "em",
            left: point.x + "em",
            backgroundColor: this.props.color,
            position: "absolute"
        }
    }
})

module.exports = Game
