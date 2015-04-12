var Phlux = require("<scripts>/utilities/Phlux")
var LoopListenerMixin = require("<scripts>/utilities/LoopListenerMixin")
var KeyboardListenerMixin = require("<scripts>/utilities/KeyboardListenerMixin")

var GameFrame = require("<scripts>/components/GameFrame")
var Zoom = require("<scripts>/components/Zoom")
var Camera = require("<scripts>/components/Camera")
var Dungeon = require("<scripts>/components/Dungeon")
var Adventurer = require("<scripts>/components/Adventurer")
var DungeonStore = require("<scripts>/components/DungeonStore")

var Level = require("<scripts>/references/level.json")

var start_x = DungeonStore.getStartX()
var start_y = DungeonStore.getStartY()

var AdventurerStore = Phlux.createStore({
    data: {
        position: {
            x: start_x,
            y: start_y
        },
        color: "#EEE",
        character: "@"
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
        LoopListenerMixin,
        KeyboardListenerMixin,
        Phlux.connectStore(DungeonStore, "dungeon"),
        Phlux.connectStore(AdventurerStore, "adventurer")
    ],
    render: function() {
       return (
           <GameFrame>
			<Zoom scale={-6}>
               <Camera target={this.state.adventurer}>
                   <Dungeon data={this.state.dungeon}/>
                   <Entity data={this.state.adventurer}/>
                   <BinarySpacePartition tree={this.state.dungeon.tree}/>
               </Camera>
			</Zoom>
           </GameFrame>
       )
   }
})

var Entity = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.props.data.character}
            </div>
        )
    },
    renderStyles: function() {
        return {
            width: "1em",
            height: "1em",
            textAlign: "center",
            color: this.props.data.color,
            position: "absolute",
            top: this.props.data.position.y + "em",
            left: this.props.data.position.x + "em",
            transitionDuration: "0.25s",
            transitionProperty: "top left",
            transitionTimingFunction: "ease-out",
        }
    }
})

var BinarySpacePartition = React.createClass({
   render: function() {
       if(this.props.tree.branch0 !== undefined
       && this.props.tree.branch1 !== undefined) {
           return (
               <div>
                   <BinarySpacePartition tree={this.props.tree.branch0}/>
                   <BinarySpacePartition tree={this.props.tree.branch1}/>
               </div>
           )
       } else {
           return (
               <div style={this.renderStyles()}/>
           )
       }
   },
   renderStyles: function() {
       return {
           position: "absolute",
           top: this.props.tree.y + "em",
           left: this.props.tree.x + "em",
           height: this.props.tree.height + "em",
           width: this.props.tree.width + "em",
           backgroundColor: this.props.tree.color,
           opacity: 0.5
       }
   }
})

module.exports = Adventurer

module.exports = Game
