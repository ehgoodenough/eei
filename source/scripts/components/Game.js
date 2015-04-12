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
            life: 3,
			gold: 5
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
		if(this.data.isDead)
		{
			return;
		}
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y - 1)) {
            if(MonsterStore.getMonster(this.data.position.x, this.data.position.y - 1)) {
                var monster = MonsterStore.getMonster(this.data.position.x, this.data.position.y - 1)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            }
				else if (ItemStore.getBomb(this.data.position.x, this.data.position.y - 1)) {}
				else  {
                this.data.position.y -= 1
				if(ItemStore.getGold(this.data.position.x, this.data.position.y)) {
					ItemStore.removeGold(this.data.position.x, this.data.position.y)
					this.data.gold+=4
				}
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyS: function() {
		if(this.data.isDead)
		{
			return;
		}
        if(DungeonStore.getTile(this.data.position.x, this.data.position.y + 1)) {
            if(MonsterStore.getMonster(this.data.position.x, this.data.position.y + 1)) {
                var monster = MonsterStore.getMonster(this.data.position.x, this.data.position.y + 1)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            }
				else if (ItemStore.getBomb(this.data.position.x, this.data.position.y + 1)) {}			
			else  {
                this.data.position.y += 1
				if(ItemStore.getGold(this.data.position.x, this.data.position.y)) {
					ItemStore.removeGold(this.data.position.x, this.data.position.y)
					this.data.gold+=4
				}
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyA: function() {
		if(this.data.isDead)
		{
			return;
		}
        if(DungeonStore.getTile(this.data.position.x - 1, this.data.position.y)) {
            if(MonsterStore.getMonster(this.data.position.x - 1, this.data.position.y)) {
                var monster = MonsterStore.getMonster(this.data.position.x - 1, this.data.position.y)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            }
			else if (ItemStore.getBomb(this.data.position.x - 1, this.data.position.y)) {}
			else  {
                this.data.position.x -= 1
				if(ItemStore.getGold(this.data.position.x, this.data.position.y)) {
					ItemStore.removeGold(this.data.position.x, this.data.position.y)
					this.data.gold+=4
				}
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    onKeyD: function() {
		if(this.data.isDead)
		{
			return;
		}
        if(DungeonStore.getTile(this.data.position.x + 1, this.data.position.y)) {
            if(MonsterStore.getMonster(this.data.position.x + 1, this.data.position.y)) {
                var monster = MonsterStore.getMonster(this.data.position.x + 1, this.data.position.y)
                Phlux.triggerAction("AttackMonster", monster.key, 1)
            } 
			else if (ItemStore.getBomb(this.data.position.x + 1, this.data.position.y )) {}
			else {
                this.data.position.x += 1
				if(ItemStore.getGold(this.data.position.x, this.data.position.y)) {
					ItemStore.removeGold(this.data.position.x, this.data.position.y)
					this.data.gold+=4
				}
                this.trigger()
            }
            Phlux.triggerAction("MoveAdventurer", this.data)
        }
    },
    "onKey.": function() {
		if(this.data.isDead)
		{
			return;
		}
        Phlux.triggerAction("MoveAdventurer", this.data)
    },
	"onKeyE": function() {
		if(this.data.gold >= 5)
		{
		 this.data.gold -= 5
		 ItemStore.placeBomb(this.data.position.x, this.data.position.y)
		 this.trigger()
		}
		
	},
    onAttackAdventurer: function(damage) {
        this.data.life -= damage
        this.trigger()
        if(this.data.life <= 0) {
			this.data.isDead = true
			this.trigger()
			Phlux.triggerAction("DisplayMessage", "You have died. :(", "red")
                window.setTimeout(function() {
                    Phlux.triggerAction("RestartGame")
                }, 1500)
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
            "character": protomonster.character,
			"see_message": protomonster.see_message
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
					var message = "A " + monster.name + " saw you!!  It " + monster.see_message + "."
                    Phlux.triggerAction("DisplayMessage", message)
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
		if(melee == true) {
			var message = "You attacked a " + monster.name + " for " + damage + " damage."
                    Phlux.triggerAction("DisplayMessage", message)
		}
		else
		{
			var message = "You blew up a " + monster.name + " for " + damage + " damage."
                    Phlux.triggerAction("DisplayMessage", message)
		}
		
        if(monster.life <= 0) {            
			Phlux.triggerAction("DropGold", monster.position)
			Phlux.triggerAction("DisplayMessage", "The " + monster.name + " is dead.")
            delete this.data[key]
            if(Object.keys(this.data).length <= 0) {
                Phlux.triggerAction("DisplayMessage", "Congratulations! You've won!", "green")
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
    onDisplayMessage: function(text, color) {
        this.data.unshift({
            "key": UUID.v4(),
            "text": text,
			"color": color || "#EEE"
        })
        this.trigger()
    }
})

var ItemStore = Phlux.createStore({
    initiateStore: function() {
        this.data = {
			"gold": {},
			"bombs": {}
		}
    },
	onMoveAdventurer: function(adventurer) {
		for(var key in this.data.bombs)
		{
			var bomb = this.data.bombs[key]
			bomb.time--
			if(bomb.time <= 0)
			{
				console.log("boom")
				for(var x = bomb.position.x - 1; x < bomb.position.x + 2; x++)
				{
					for(var y = bomb.position.y - 1; y < bomb.position.y + 2; y++)
					{
						var monster = MonsterStore.getMonster(x, y)
						
						if(AdventurerStore.data.position.x == x && AdventurerStore.data.position.y == y)
						{
							Phlux.triggerAction("AttackAdventurer", 999)
							var message = "You blew yourself up.  Good job."
                    Phlux.triggerAction("DisplayMessage", message, "red")
						}
						
						if(monster)
						{
							Phlux.triggerAction("AttackMonster", monster.key, 999)
						}
					}
				}
				delete this.data.bombs[key]
			}
		}
		this.trigger()
	},
	getGold: function(x, y) {
		if(this.data.gold[x + "x" + y]){
			return this.data.gold[x + "x" + y]
		}
	},
	removeGold: function(x, y) {
		if(this.data.gold[x + "x" + y]){
			delete this.data.gold[x + "x" + y]
		}
		this.trigger()
	},
	getBomb: function(x, y) {
		if(this.data.bombs[x + "x" + y]){
			return this.data.bombs[x + "x" + y]
		}
	},
	placeBomb: function(x, y) {
		this.data.bombs[x + "x" + y] = {
			"position": {
				"x": x,
				"y": y
			},
			"value": 1,
			"time": 5
		}
		this.trigger()
	},
    onRestartGame: function() {
        this.initiateStore()
    },
    onDropGold: function(position) {
		this.data.gold[position.x + "x" + position.y] = {
			"position": {
				"x": position.x,
				"y": position.y
			},
			"value": 1
		}
		this.trigger()
    },
})

var Game = React.createClass({
    mixins: [
        LoopListenerMixin,
        KeyboardListenerMixin,
        Phlux.connectStore(DungeonStore, "dungeon"),
        Phlux.connectStore(MonsterStore, "monsters"),
        Phlux.connectStore(MessageStore, "messages"),
        Phlux.connectStore(AdventurerStore, "adventurer"),
		Phlux.connectStore(ItemStore, "items")
    ],
    render: function() {
	   return (
            <GameFrame>
                <Camera target={this.state.adventurer}>
                    <Dungeon data={this.state.dungeon}/>
                    <Entity data={this.state.adventurer}/>
					{this.renderItems(this.state.items)}
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
    },
	renderItems: function(items) {
		var renderings = []
		for(var key in items.gold) {
			renderings.push(
				<GoldPile key={key}
				data={items.gold[key]}/>
			)
		}
		
		for(var key in items.bombs) {
			renderings.push(
				<BombPile key={key}
				data={items.bombs[key]}/>
			)
		}
		
		return renderings
	}
})

var AdventurerStatus = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.renderGold()}
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
    },
	renderGold: function() {
		return (
			<span className="heart" style={{color:"#E8B51C", fontSize: "1.5em"}}>
				{this.props.data.gold}
			</span>
		)
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

var GoldPile = React.createClass({
    render: function() {
		return (
			<div style={this.renderStyles()}>
			.:.
			</div>
		)
	},
	renderStyles: function() {
		return {
			color: "#E8B51C",
			position: "absolute",
			top: this.props.data.position.y + "em",
			left: this.props.data.position.x + "em",
			width: "1em",
			height: "1em",
			textAlign: "center"
		}
	}
})

var BombPile = React.createClass({
    render: function() {
		return (
			<div className="bomb" style={this.renderStyles()}>
			*
			</div>
		)
	},
	renderStyles: function() {
		return {
			color: "#000",
			position: "absolute",
			top: this.props.data.position.y + "em",
			left: this.props.data.position.x + "em",
			width: "1em",
			height: "1em",
			textAlign: "center",
		}
	}
})

module.exports = Game
