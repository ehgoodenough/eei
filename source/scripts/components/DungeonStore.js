var Phlux = require("<scripts>/utilities/Phlux")

var DungeonStore = Phlux.createStore({
    data: {
        width: 20,
        height: 15,
        tiles: {}
    },
    initiateStore: function() {
		this.makeRoom(5, 5, 10, 10)
    },
    getTile: function(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data.tiles[x + "x" + y]
    },
	makeRoom: function(x, y, width, height) {
		total_width = width + x
		total_height = height + y
		
		for(; x <= total_width; x++)
		{
			for(var tile_y = y; tile_y <= total_height; tile_y++)
			{
			
			this.data.tiles[x + "x" + tile_y] = {
				position: {
					"x": x,
					"y": tile_y
				},
				"value": 1
				}			
			}
		}
	}
})

module.exports = DungeonStore