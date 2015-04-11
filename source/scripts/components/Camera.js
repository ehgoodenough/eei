var Camera = React.createClass({
    propTypes: {
        target: React.PropTypes.shape({
            position: React.PropTypes.shape({
                x: React.PropTypes.number.isRequired,
                y: React.PropTypes.number.isRequired
            }).isRequired
        }).isRequired
    },
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.props.children}
            </div>
        )
    },
    renderStyles: function() {
        return {
            position: "absolute",
            top: (this.props.target.position.y - (HEIGHT / 2)) * -1 + "em",
            left: (this.props.target.position.x - (WIDTH / 2)) * -1 + "em",
            transitionTimingFunction: "ease-out",
            transitionProperty: "top left",
            transitionDuration: "0.25s"
        }
    }
})

module.exports = Camera
