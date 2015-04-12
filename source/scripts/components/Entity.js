var Entity = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.props.data.character}
                {this.renderEmote()}
            </div>
        )
    },
    renderStyles: function() {
        var styles = {
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
        if(this.props.blip == true) {
            styles.backgroundColor = this.props.data.color
        }
		if(this.props.data.isDead) {
			styles.color = "red"
		}
        return styles
    },
    renderEmote: function() {
        if(this.props.data.emote != undefined) {
            return (
                <Emote data={this.props.data.emote}/>
            )
        }
    }
})

var Emote = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.renderText()}
            </div>
        )
    },
    renderStyles: function() {
        return {
            left: "0em",
            right: "0em",
            top: "-1em",
            position: "absolute",
            textAlign: "center"

        }
    },
    renderText: function() {
        if(this.props.data == "alarmed") {
             return "!!"
        } else if(this.props.data == "confused") {
            return "?!"
        } else if(this.props.data == "idle") {
            return null
        } else {
            return ".."
        }
    }
})

module.exports = Entity
