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

module.exports = Entity
