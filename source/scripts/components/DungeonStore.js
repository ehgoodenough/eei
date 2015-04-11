var Phlux = require("<scripts>/utilities/Phlux")

var DungeonStore = Phlux.createStore({
    data: {
        width: 60,
        height: 45,
        tiles: {},
		rooms: {},
		min_width: 10,
		min_height: 7,
		tree: {
		   "branch0": {
			   "branch0": {
				   "x": 0*WIDTH,
				   "y": 0*HEIGHT,
				   "width": 1*WIDTH,
				   "height": 1*HEIGHT,
				   "color": "red"
			   },
			   "branch1": {
				   "x": 1*WIDTH,
				   "y": 0*HEIGHT,
				   "width": 2*WIDTH,
				   "height": 1*HEIGHT,
				   "color": "orange"
			   }
		   },
		   "branch1": {
			   "branch0": {
				   "x": 0*WIDTH,
				   "y": 1*HEIGHT,
				   "width": 2*WIDTH,
				   "height": 2*HEIGHT,
				   "color": "blue"
			   },
			   "branch1": {
				   "x": 2*WIDTH,
				   "y": 1*HEIGHT,
				   "width": 1*WIDTH,
				   "height": 2*HEIGHT,
				   "color": "purple"
			   }
		   }
		}
    },
    initiateStore: function() {
		var size = 3
		var room_width = WIDTH - 1
		var room_height = HEIGHT - 1	
		
		//partition rooms
		for(var column = 0; column < size; column++)
		{
			for(var row = 0; row < size; row++)
			{
				this.data.rooms[row + "x" + column] = {
					"x": row * WIDTH,
					"y": column * HEIGHT,
					"width": Math.floor(Math.random() * 10) + 5,
					"height": Math.floor(Math.random() * 10) + 5
				}				
			}
		}
		
		//doors
		for (column = 0; column < size; column++)
		{
				for(row = 0; row < size; row++)
				{
					//horizontal
					if(row != size - 1)
					{
						this.makeRoom(row * WIDTH + Math.floor((room_width / 2)), column * HEIGHT + Math.floor((room_height / 2)), HEIGHT, 1)
					}
					
					//vertical
					if(column != size - 1)
					{
						this.makeRoom(row * WIDTH + Math.floor((room_width / 2)), column * HEIGHT + Math.floor((room_height / 2)), 1, HEIGHT)
					}
				}
		}
		
		//make room tiles
		/*for(var index in this.data.rooms)
		{
			var room = this.data.rooms[index]
			console.log(room)
			this.makeRoom(room.x, room.y, room.width, room.height)
		}*/
	
		this.data.tree = {
			"x": 0,
			"y": 0,
			"width": this.data.width,
			"height": this.data.height
		}
		
		this.data.tree = this.partition(this.data.tree)
		
		//this.preOrder(this.tree.root)		
		
		
    },
	getRandomColor: function() {
		return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
	},
	partition: function(node) {
		var cut_offset = 4
		
		if(Math.random() < 0)
		{
			return node;
		}
		else
		{
			var cut = Math.floor(Math.random() * (node.width - cut_offset)) + node.x + cut_offset
			node_x = node.x
			node_y = node.y
			node_width = node.width
			node_height = node.height
			
			//if one of the resulting rooms would be smaller than min_width
			if(cut - node_x < this.data.min_width || node_x + node_width - cut < this.data.min_width)
			{
				return node;
			}
			else
			{			
				node = {
					"branch0": {
						"x": node_x,
						"y": node_y,
						"width": cut - node_x,
						"height": node_height,
						"color": this.getRandomColor()
					},
					"branch1": {
						"x": cut,
						"y": node_y,
						"width": node_x + node_width - cut,
						"height": node_height,
						"color": this.getRandomColor()
					}
				}
				node.branch0 = this.partition(node.branch0)
				node.branch1 = this.partition(node.branch1)
			}
		}
		
		return node;
	},
	preOrder: function(node) {
		if(node.x != null)
		{
			//console.log(node)
		}
		else
		{
			this.preOrder(node.branch0)
			this.preOrder(node.branch1)
		}
		return;
	},
    getTile: function(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data.tiles[x + "x" + y]
    },
	makeRoom: function(x, y, width, height) {
		total_width = width + x
		total_height = height + y
		
		for(; x < total_width; x++)
		{
			for(var tile_y = y; tile_y < total_height; tile_y++)
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