var UUID = require("node-uuid")
var BinaryHeap = require("yabh")
var Phlux = require("<scripts>/utilities/Phlux")
var LoopListenerMixin = require("<scripts>/utilities/LoopListenerMixin")
var KeyboardListenerMixin = require("<scripts>/utilities/KeyboardListenerMixin")

var GameFrame = require("<scripts>/components/GameFrame")
var Point = require("<scripts>/components/Point")
var Zoom = require("<scripts>/components/Zoom")
var Camera = require("<scripts>/components/Camera")
var Dungeon = require("<scripts>/components/Dungeon")
var Entity = require("<scripts>/components/Entity")
var Messages = require("<scripts>/components/Messages")

var DungeonData = require("<scripts>/references/DungeonData.json")
var MonsterData = require("<scripts>/references/MonsterData.json")

var AdventurerStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {
            position: {
                x: 9,
                y: 9
            },
            color: "#111",
            character: "@",
            life: 3
        }
        this.trigger()
    },
    onRestartGame: function() {
        this.initiateStore()
    },
    onKeyW: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1)) {
            this.data.position.y -= 1
            Phlux.triggerAction("MoveAdventurer", this.data)
            this.trigger()
        }
    },
    onKeyS: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1)) {
            this.data.position.y += 1
            Phlux.triggerAction("MoveAdventurer", this.data)
            this.trigger()
        }
    },
    onKeyA: function() {
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y)) {
            this.data.position.x -= 1
            Phlux.triggerAction("MoveAdventurer", this.data)
            this.trigger()
        }
    },
    onKeyD: function() {
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y)) {
            this.data.position.x += 1
            Phlux.triggerAction("MoveAdventurer", this.data)
            this.trigger()
        }
    },
    "onKey.": function() {
        Phlux.triggerAction("MoveAdventurer", this.data)
    },
    onAttackAdventurer: function(damage) {
        this.data.life -= damage
        this.trigger()
        if(this.data.life <= 0) {
            Phlux.triggerAction("RestartGame")
        } else {
            this.trigger()
        }
    }
})

var DungeonStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {
            width: 20,
            height: 15,
            tiles: {}
        }
        this.data.width = DungeonData.width
        this.data.height = DungeonData.height
        var tiles = DungeonData.layers[0].data
        for(var x = 0; x < DungeonData.width; x++) {
            for(var y = 0; y < DungeonData.height; y++) {
                var tile = tiles[y * DungeonData.width + x] - 1
                if(tile === 1) {
                    this.data.tiles[x + "x" + y] = {
                        position: {
                            "x": x,
                            "y": y
                        },
                        "value": tile
                    }
                }
            }
        }
        this.trigger()
    },
    onRestartGame: function() {
        this.initiateStore()
    },
    getTile: function(x, y) {
        return this.data.tiles[Math.floor(x) + "x" + Math.floor(y)]
    },
    getNeighboringTiles: function(point) {
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
    getShortestPath: function(initial_point, final_point) {
        var path = new Array()
        var closed_points = new Object()
        var open_points = new BinaryHeap(function(point) {
            return point.score
        })
        initial_point = {
            "x": initial_point.x,
            "y": initial_point.y,
            "score": 0
        }
        final_point = {
            "x": final_point.x,
            "y": final_point.y
        }
        closed_points[initial_point.x + "x" + initial_point.y] = initial_point
        open_points.push(initial_point)
        var heuristic = function(initial_point, final_point) {
            var x = Math.abs(initial_point.x - final_point.x)
            var y = Math.abs(initial_point.y - final_point.y)
            return x + y
        }
        while(open_points.size() > 0) {
            var current_point = open_points.pop()
            if(current_point.x == final_point.x
            && current_point.y == final_point.y) {
                path.unshift(current_point)
                break;
            }
            var neighboring_tiles = this.getNeighboringTiles(current_point)
            for(var index in neighboring_tiles) {
                var neighbor_tile = neighboring_tiles[index]
                var neighbor_point = {
                    x: neighbor_tile.position.x,
                    y: neighbor_tile.position.y,
                    previous_point: current_point,
                    score: current_point.score + 1
                }
                neighbor_point.score += heuristic(neighbor_point, final_point)
                var neighbor_coords = neighbor_point.x + "x" + neighbor_point.y
                if(closed_points[neighbor_coords] === undefined) {
                    closed_points[neighbor_coords] = neighbor_point
                    open_points.push(neighbor_point)
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
    isUnobstructedLine: function(initial_point, final_point) {
        var points = this.getPointLine(initial_point, final_point)
        for(var index in points) {
            var point = points[index]
            if(this.getTile(point.x, point.y) === undefined) {
                return false
            }
        }
        return true
    },
    getPointLine: function(initial_point, final_point) {
        var x = final_point.x - initial_point.x
        var y = final_point.y - initial_point.y
        var points = new Array()
        if(Math.abs(x) >= Math.abs(y)) {
            if(x > 0) {
                for(var lx = 0, ly = 0; lx <= x; lx++, ly += y / x) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            } else if(x < 0) {
                for(var lx = 0, ly = 0; lx >= x; lx--, ly -= y / x) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            }
        } else {
            if(y > 0) {
                for(var lx = 0, ly = 0; ly <= y; ly++, lx += x / y) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            } else if(y < 0) {
                for(var lx = 0, ly = 0; ly >= y; ly--, lx -= x / y) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            }
        }
        return points
    }
})

var MonsterStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {}
        this.addMonster(MonsterData.dragon, {x: 2, y: 2})
        this.addMonster(MonsterData.demon, {x: 17, y: 5})
        this.trigger()
    },
    onRestartGame: function() {
        this.initiateStore()
    },
    addMonster: function(protomonster, position) {
        var key = UUID.v4()
        this.data[key] = {
            "key": key,
            "path": [],
            "emote": "idle",
            "position": position,
            "name": protomonster.name,
            "color": protomonster.color,
            "damage": protomonster.damage,
            "character": protomonster.character
        }
    },
    onMoveAdventurer: function(adventurer) {
        for(var key in this.data) {
            var monster = this.data[key]
            if(monster.emote) {
                if(monster.emote === "confused") {
                    monster.emote = "idle"
                }
                if(monster.emote === "alarmed") {
                    monster.emote = "angry"
                }
            }
            if(monster.path.length > 0) {
                var next_position = monster.path.shift()
                if(next_position.x == adventurer.position.x
                && next_position.y == adventurer.position.y) {
                    monster.path.unshift(next_position)
                    Phlux.triggerAction("AttackAdventurer", monster.damage)
                    var message = "A " + monster.name + " attacks you for " + monster.damage + " damage."
                    Phlux.triggerAction("DisplayMessage", message)
                } else {
                    monster.previous_position = monster.position
                    monster.position = {
                        "x": next_position.x,
                        "y": next_position.y
                    }
                }
            } else {
                if(monster.emote === "angry"
                || monster.emote === "alarmed") {
                    monster.emote = "confused"
                }
            }
            if(DungeonStore.isUnobstructedLine(monster.position, adventurer.position)) {
                if(monster.emote !== "angry") {
                    monster.emote = "alarmed"
                }
                monster.target_position = {
                    "x": adventurer.position.x,
                    "y": adventurer.position.y
                }
                monster.path = DungeonStore.getShortestPath(monster.position, monster.target_position)
            }
            monster.line = DungeonStore.getPointLine(monster.position, adventurer.position)
            this.trigger()
        }
    }
})

var MessageStore = Phlux.createStore({
    initiateStore: function() {
        this.data = []
        this.data.unshift({
            "key": UUID.v4(),
            "text": "Welcome to Unnamed! :]"
        })
        window.setTimeout(function() {
            this.data.unshift({
                "key": UUID.v4(),
                "text": "Try not to die, okay?"
            })
            this.trigger()
        }.bind(this), 2000)
        window.setTimeout(function() {
            if(AdventurerStore.data.position.x === 9
            && AdventurerStore.data.position.y === 9) {
                this.data.unshift({
                    "key": UUID.v4(),
                    "text": "Used WASD to move."
                })
                this.trigger()
            }
        }.bind(this), 4000)
    },
    onRestartGame: function() {
        this.data = []
        this.data.unshift({
            "key": UUID.v4(),
            "text": "Yeah, you'll die a lot. Sorry."
        })
        this.trigger()
    },
    onDisplayMessage: function(text) {
        this.data.unshift({
            "key": UUID.v4(),
            "text": text
        })
        this.trigger()
    }
})

var Game = React.createClass({
    mixins: [
        LoopListenerMixin,
        KeyboardListenerMixin,
        Phlux.connectStore(DungeonStore, "dungeon"),
        Phlux.connectStore(MonsterStore, "monsters"),
        Phlux.connectStore(MessageStore, "messages"),
        Phlux.connectStore(AdventurerStore, "adventurer")
    ],
    render: function() {
        return (
            <GameFrame>
                <Camera target={this.state.adventurer}>
                    <Dungeon data={this.state.dungeon}/>
                    <Entity data={this.state.adventurer}/>
                    {this.renderEntities(this.state.monsters)}
                    {this.renderPoints(this.state.monsters, "line", "red")}
                    {this.renderPoints(this.state.monsters, "path", "yellow")}
                </Camera>
                <AdventurerStatus data={this.state.adventurer}/>
                <Messages data={this.state.messages}/>
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
    },
    renderPoints: function(entities, attribute, color) {
        var points = {}
        for(var key in entities) {
            var entity = entities[key]
            for(var index in entity[attribute]) {
                var point = entity[attribute][index]
                if(points[point.x + "x" + point.y] === undefined) {
                    points[point.x + "x" + point.y] = point
                }
            }
        }
        var renderings = []
        for(var key in points) {
            var point = points[key]
            renderings.push(
                <Point key={key}
                    data={point}
                    color={color}/>
            )
        }
        return renderings
    }
})

var AdventurerStatus = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.renderHearts()}
            </div>
        )
    },
    renderStyles: function() {
        return {
            top: "0em",
            right: "0em",
            position: "absolute",
            paddingRight: "0.25em",
        }
    },
    renderHearts: function() {
        var renderings = []
        for(var index = 0; index < 3; index++) {
            if(index < this.props.data.life) {
                renderings.push(
                    <AdventurerHeart key={index}
                        beating={true}/>
                )
            } else {
                renderings.push(
                    <AdventurerHeart key={index}
                        beating={false}/>
                )
            }
        }
        return renderings
    }
})

var AdventurerHeart = React.createClass({
    render: function() {
        return (
            <span className="heart"
                style={this.renderStyles()}>
                ❤
            </span>
        )
    },
    renderStyles: function() {
        return {
            fontSize: "2em",
            paddingLeft: "0.1em",
            color: this.props.beating ? "#C33" : "#EEE"
        }
    }
})

module.exports = Game
