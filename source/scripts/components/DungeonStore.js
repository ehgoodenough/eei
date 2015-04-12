var Phlux = require("<scripts>/utilities/Phlux")

var DungeonStore = Phlux.createStore({
    data: {
        width: 60,
        height: 45,
        tiles: {},
		rooms: {},
		min_width: 10,
		min_height: 7,
		adventurer_x: 0,
		adventurer_y: 0
    },
    initiateStore: function() {
		var size = 3
		var room_width = WIDTH - 1
		var room_height = HEIGHT - 1	
		
		//empty tree	
		this.data.tree = {
			"x": 0,
			"y": 0,
			"width": this.data.width,
			"height": this.data.height
		}
		
		//partition into spaces
		this.data.tree = this.partition(this.data.tree)
		
		//draw rooms inside spaces
		this.makeTreeRooms(this.data.tree)		
		
		//figure out which rooms to connect
		var rooms_to_connect = []
		rooms_to_connect = this.euler(this.data.tree, rooms_to_connect)
		
		var start_room = this.getBoundaries(rooms_to_connect[0])
		
		this.data.adventurer_x = Math.floor((start_room.min_x + start_room.max_x) / 2)
		this.data.adventurer_y = Math.floor((start_room.min_y + start_room.max_y) / 2)
		
		//connect rooms
		this.makeTreeDoors(rooms_to_connect)
		
		console.log(rooms_to_connect)
		console.log(this.data.tree)
		
    },
	getStartX: function() {
		return this.data.adventurer_x
	},
	getStartY: function() {
		return this.data.adventurer_y
	},
	getRandomColor: function() {
		return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
	},
	partition: function(node) {
		return this.partition_vertical(node)
	},
	partition_vertical: function(node) {
		var cut_offset = 2
		
		if(Math.random() < 0)
		{
			return node;
		}
		else
		{
			var cut = Math.floor(Math.random() * (node.height - cut_offset)) + node.y + cut_offset
			node_x = node.x
			node_y = node.y
			node_width = node.width
			node_height = node.height
			
			//if one of the resulting rooms would be smaller than min_width
			if(cut - node_y <= this.data.min_height || node_y + node_height - cut <= this.data.min_height)
			{
				return node;
			}
			else
			{
				var old_node = node
				node = {
					"branch0": {
						"x": node_x,
						"y": node_y,
						"width": node_width,
						"height": cut - node_y,
						"color": this.getRandomColor(),
						"parent": old_node
					},
					"branch1": {
						"x": node_x,
						"y": cut,
						"width": node_width,
						"height": node_y + node_height - cut,
						"color": this.getRandomColor(),
						"parent": old_node
					}
				}
				
				node.branch0.sibling = node.branch1
				node.branch1.sibling = node.branch0
				
				node.branch0 = this.partition_horizontal(node.branch0)
				node.branch1 = this.partition_horizontal(node.branch1)
			}
		}
		
		return node;
	},
	partition_horizontal: function(node) {
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
			if(cut - node_x <= this.data.min_width || node_x + node_width - cut <= this.data.min_width)
			{
				return node;
			}
			else
			{
				var old_node = node
				node = {
					"branch0": {
						"x": node_x,
						"y": node_y,
						"width": cut - node_x,
						"height": node_height,
						"color": this.getRandomColor(),
						"parent": old_node
					},
					"branch1": {
						"x": cut,
						"y": node_y,
						"width": node_x + node_width - cut,
						"height": node_height,
						"color": this.getRandomColor(),
						"parent": old_node						
					}
				}
				node.branch0.sibling = node.branch1
				node.branch1.sibling = node.branch0
				
				node.branch0 = this.partition_vertical(node.branch0)
				node.branch1 = this.partition_vertical(node.branch1)
			}
		}
		
		return node;
	},
	makeTreeRooms: function(node) {
		if(node.x != null)
		{
			//offset into partition for random-looking rooms
			node.x_offset = Math.floor(Math.random() * node.width) + 1	
			node.y_offset = Math.floor(Math.random() * node.height) + 1 
			
			//fix offset if it'd reach partition boundary
			if(node.width - node.x_offset - 1 < this.data.min_width)
			{
				node.x_offset = node.width - this.data.min_width
			}
			if(node.height - node.y_offset - 1 < this.data.min_height)
			{
				node.y_offset = node.height - this.data.min_height
			}			

			//oh god slight magic number mods everywhere don't read this
			this.makeRoom(node.x + node.x_offset, node.y + node.y_offset, node.width - node.x_offset - 1, node.height - node.y_offset - 1)
		}
		else
		{
			this.makeTreeRooms(node.branch0)
			this.makeTreeRooms(node.branch1)
		}
		return;
	},
	euler: function(node, node_array) {
		
		//console.log("Visiting:", node)
		if(node.branch0 != null)
		{
			this.euler(node.branch0, node_array)
		}
		if(node.branch1 != null)
		{
			this.euler(node.branch1, node_array)
		}
		else
		{
			node_array.push(node)
			return;
		}
		return node_array;
	},
	makeTreeDoors: function(node_array) {		
		for(var i = 0; i < node_array.length - 1; i++)
		{
			this.makeDoor(node_array[i], node_array[i + 1])
		}
	},
	makeDoor: function(node1, node2) {
		var range1 = this.getBoundaries(node1)
		var range2 = this.getBoundaries(node2)
		
		var x_mis = false
		var y_mis = false
		
		console.log(range1, range2)
		
		//if not aligned at all
		if((range2.min_x > range1.max_x) || (range1.min_x > range2.max_x))
		{
			console.log("	x not aligned")
			x_mis = true
		}
		if((range2.min_y > range1.max_y) || (range1.min_y > range2.max_y))
		{
				console.log("	y not aligned")
				y_mis = true
		}
		if(x_mis && y_mis)
		{
			//needs corner
			console.log("	misaligned")
		}
		else
		{
			//connect -> horizontal
			if(x_mis)
			{
				console.log("	connecting horiz")
				this.makeDoorHoriz(node1, node2, range1, range2)
			}
			//connect v^ vertical
			else
			{
				console.log("	connecting vert")
				this.makeDoorVert(node1, node2, range1, range2)
			}
		}		
	},
	makeDoorHoriz: function(node1, node2, range1, range2){
		var start_x, stop_x, start_y, stop_y, path_y
		if(range1.max_x < range2.max_x)
		{
			start_x = range1.max_x
		}
		else
		{
			start_x = range2.max_x
		}
		
		if(range1.min_x > range2.min_x)
		{
			stop_x = range1.min_x
		}
		else
		{
			stop_x = range2.min_x
		}
		
		if(range1.max_y < range2.max_y)
		{
			start_y = range1.max_y
		}
		else
		{
			start_y = range2.max_y
		}
		
		if(range1.min_y > range2.min_y)
		{
			stop_y = range1.min_y
		}
		else
		{
			stop_y = range2.min_y
		}
		
		
		path_y = Math.floor(Math.random() * (stop_y - start_y)) + start_y
		
		console.log(start_y, stop_y, (stop_y - start_y) + start_y, path_y)
		
		this.makeRoom(start_x, path_y, (stop_x - start_x), 1)
		
		
	},
	makeDoorVert: function(node1, node2, range1, range2){
	var start_x, stop_x, start_y, stop_y, path_x
		if(range1.max_x < range2.max_x)
		{
			start_x = range1.max_x
		}
		else
		{
			start_x = range2.max_x
		}
		
		if(range1.min_x > range2.min_x)
		{
			stop_x = range1.min_x
		}
		else
		{
			stop_x = range2.min_x
		}
		
		if(range1.max_y < range2.max_y)
		{
			start_y = range1.max_y
		}
		else
		{
			start_y = range2.max_y
		}
		
		if(range1.min_y > range2.min_y)
		{
			stop_y = range1.min_y
		}
		else
		{
			stop_y = range2.min_y
		}
		
		
		
		path_x = Math.floor(Math.random() * (stop_x - start_x)) + start_x
		
		console.log(start_x, stop_x, (stop_x - start_x) + start_x, path_x)
		
		console.log("connecting path should be:",path_x, start_y, 1, (stop_x - start_x))
		this.makeRoom(path_x, start_y, 1, (stop_y - start_y))
	},
	getBoundaries: function(node) {
		var minx = node.x + node.x_offset
		var miny = node.y + node.y_offset
		var ranges = {
			"min_x": minx,
			"max_x":  minx + (node.width - node.x_offset - 1),
			"min_y": miny,
			"max_y": miny + (node.height - node.y_offset - 1)
		}
		
		return ranges
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