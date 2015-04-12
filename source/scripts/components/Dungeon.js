var Dungeon = React.createClass({
    render: function() {
        return (
            <canvas ref="canvas"
                style={this.renderStyles()}
                width={this.props.data.width * 64}
                height={this.props.data.height * 64}/>
        )
    },
    renderStyles: function() {
        var styles = {
            "width": this.props.data.width + "em",
            "height": this.props.data.height + "em",
            "backgroundColor": this.tiles.colors[0]
        }
        if(this.props.minimap === true) {
            styles.position = "absolute"
            styles.backgroundColor = "#303030"
        }
        return styles
    },
    renderCanvas: function() {
        var canvas = this.refs.canvas.getDOMNode().getContext("2d")
        for(var coord in this.props.data.tiles) {
            var tile = this.props.data.tiles[coord]
            canvas.fillStyle = this.tiles.colors[tile.value]
            if(this.props.minimap === true) {
                canvas.fillStyle = "#A4A4A4"
            }
            var x = tile.position.x * 64
            var y = tile.position.y * 64
            canvas.fillRect(x, y, 64, 64)
        }
    },
    componentDidMount: function() {
        this.renderCanvas()
    },
    shouldComponentUpdate: function(props) {
        return props.data.tiles != this.props.data.tiles
    },
    componentDidUpdate: function() {
        this.renderCanvas()
    },
    tiles: {
        "colors": {
            0: "#507642",
            1: "#CCCFBC"
        }
    }
})

module.exports = Dungeon
