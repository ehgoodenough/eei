var Adventurer = React.createClass({
    render: function() {
        return (
            <div style={this.renderStyles()}>
                @
            </div>
        )
    },
    renderStyles: function() {
        return {
            width: "1em",
            height: "1em",
            color: "#EEE",
            lineHeight: "1em",
            textAlign: "center",
            position: "absolute",
            top: this.props.data.position.y + "em",
            left: this.props.data.position.x + "em",
            transitionProperty: "top left",
            transitionDuration: "0.25s"
        }
    }
})

module.exports = Adventurer
