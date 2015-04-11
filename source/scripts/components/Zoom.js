var Zoom = React.createClass({
    propTypes: {
        scale: React.PropTypes.number.isRequired
    },
    componentWillMount: function() {
        if(this.props.scale < 0) {
            WIDTH *= Math.abs(this.props.scale)
            HEIGHT *= Math.abs(this.props.scale)
        } else {
            WIDTH /= this.props.scale
            HEIGHT /= this.props.scale
        }
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
