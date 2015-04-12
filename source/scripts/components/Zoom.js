var Zoom = React.createClass({
    propTypes: {
        scale: React.PropTypes.number.isRequired
    },
    render: function() {
        return (
            <div style={this.renderStyles()}>
                {this.props.children}
            </div>
        )
    },
    renderStyles: function() {
        if(this.props.scale < 0) {
            return {
                fontSize: Math.abs(1 / this.props.scale) + "em"
            }
        } else {
            return {
                fontSize: this.props.scale + "em"
            }
        }
    }
})

module.exports = Zoom
