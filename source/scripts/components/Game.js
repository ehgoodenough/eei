var UUID = require("node-uuid")
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

var DungeonStore = require("<scripts>/components/DungeonStore")
var AdventurerStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {
            position: {
                x: DungeonStore.getStartX(),
                y: DungeonStore.getStartY()
            },
            color: "#111",
            character: "@",
            life: 3
        }
        window.setTimeout(function() {
            Phlux.triggerAction("MoveAdventurer", this.data)
        }.bind(this), 1)
        this.trigger()
    },
    onRestartGame: function() {
        this.initiateStore()
    },
    onKeyW: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1)) {
            if(MonsterStore.getMonster(this.data.position.x, this.data.position.y - 1)) {
                var monster = MonsterStore.getMonster(this.data.position.x, this.data.position.y - 1)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            } else  {
                this.data.position.y -= 1
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyS: function() {
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1)) {
            if(MonsterStore.getMonster(this.data.position.x, this.data.position.y + 1)) {
                var monster = MonsterStore.getMonster(this.data.position.x, this.data.position.y + 1)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            } else  {
                this.data.position.y += 1
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyA: function() {
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y)) {
            if(MonsterStore.getMonster(this.data.position.x - 1, this.data.position.y)) {
                var monster = MonsterStore.getMonster(this.data.position.x - 1, this.data.position.y)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            } else  {
                this.data.position.x -= 1
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyD: function() {
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y)) {
            if(MonsterStore.getMonster(this.data.position.x + 1, this.data.position.y)) {
                var monster = MonsterStore.getMonster(this.data.position.x + 1, this.data.position.y)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            } else {
                this.data.position.x += 1
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
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
            return true
        } else {
            this.trigger()
            return false
        }
    }
})

var MonsterStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {}
        var rooms = DungeonStore.getRooms()
        for(var index = 1; index < rooms.length - 1; index++) {
            var room = rooms[index]
            this.addMonstersToRoom(room, 1, false)
        }
        this.addMonstersToRoom(rooms[rooms.length - 1], 2, false)
        this.addMonstersToRoom(rooms[rooms.length - 1], 1, true)
        this.trigger()
    },
    addMonstersToRoom: function(room, amount, isRare)
    {
        for(var index = 0; index < amount; index++) {
            var width = room.max_x - room.min_x
            var height = room.max_y - room.min_y
            var x = Math.floor(Math.random() * width) + room.min_x
            var y = Math.floor(Math.random() * height) + room.min_y
            var protomonster
            if(isRare) {
                protomonster = this.getRandomProperty(MonsterData.rare)
            } else {
                protomonster = this.getRandomProperty(MonsterData.common)
            }
            this.addMonster(protomonster, {"x": x, "y": y})
        }
    },
    getRandomProperty: function(obj) {
        var count = 0, result;
        for (var prop in obj) {
            if (Math.random() < 1/++count) {
                result = obj[prop];
            }
        }
        return result
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
            "life": protomonster.life,
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
                    var message = "A " + monster.name + " attacks you for " + monster.damage + " damage."
                    Phlux.triggerAction("DisplayMessage", message)
                    var isDead = AdventurerStore.onAttackAdventurer(monster.damage)
                    if(isDead == true) {
                        break
                    }
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
    },
    onAttackMonster: function(key, damage, melee) {
        var monster = this.data[key]
        monster.life -= damage
        if(monster.life <= 0) {
            if(melee == true) {
                Phlux.triggerAction("DropBomb", monster.position)
            } else {
                Phlux.triggerAction("DropGold", monster.position)
            }
            delete this.data[key]
            if(Object.keys(this.data).length <= 0) {
                Phlux.triggerAction("DisplayMessage", "Congratulations! You've won!")
                window.setTimeout(function() {
                    Phlux.triggerAction("RestartGame")
                }, 5000)
            }
        }
        this.trigger()
    },
    getMonster: function(x, y) {
        for(var key in this.data) {
            var monster = this.data[key]
            if(monster.position.x == x
            && monster.position.y == y) {
                return monster
            }
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

var ItemStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {}
    },
    onRestartGame: function() {
        this.initiateStore()
    },
    onDropGold: function(position) {
        console.log(position)
    },
    onDropBomb: function(position) {
        console.log(position)
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
                </Camera>
                <AdventurerStatus data={this.state.adventurer}/>
                <Messages data={this.state.messages}/>
                <Zoom scale={-12}>
                    <Dungeon data={this.state.dungeon} minimap={true}/>
                    <Entity data={this.state.adventurer} blip={true}/>
                </Zoom>
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
