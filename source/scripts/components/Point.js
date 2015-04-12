var Points = React.createClass({
    render: function() {
        return (
            <div>
                {this.renderPoints()}
            </div>
        )
    },
    renderPoints: function() {
        var renderings = []
        for(var key in this.props.data) {
            var point = this.props.data[key]
            renderings.push(
                <div key={key} style={this.renderStyles(point)}/>
            )
        }
        return renderings
    }
})

var Point = React.createClass({
    propTypes: {
        data: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        }).isRequired
    },
    render: function() {
        return (
            <div style={this.renderStyles()}/>
        )
    },
    renderStyles: function(point) {
        return {
            width: "1em",
            height: "1em",
            opacity: "0.25",
            top: this.props.data.y + "em",
            left: this.props.data.x + "em",
            backgroundColor: this.props.color,
            position: "absolute"
        }
    }
})

module.exports = Point
