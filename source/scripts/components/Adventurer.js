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
            position: "absolute",
            textAlign: "center",
            top: this.props.data.position.y + "em",
            left: this.props.data.position.x + "em",
            transitionTimingFunction: "ease-out",
            transitionProperty: "top left",
            transitionDuration: "0.25s",
            backgroundColor: "red"
        }
    }
})

module.exports = Adventurer
