var Phlux = require("<scripts>/utilities/Phlux")

var DungeonStore = Phlux.createStore({
    data: {
        width: 60,
        height: 45,
        tiles: {},
		rooms: {},
		min_width: 10,
		min_height: 7,
    },
    initiateStore: function() {
		var size = 3
		var room_width = WIDTH - 1
		var room_height = HEIGHT - 1	
		
		//doors
		/*for (column = 0; column < size; column++)
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
		}*/
		
		//make room tiles	
		this.data.tree = {
			"x": 0,
			"y": 0,
			"width": this.data.width,
			"height": this.data.height
		}
		
		this.data.tree = this.partition(this.data.tree)
		
		this.makeTreeRooms(this.data.tree)		
		
		//this.makeTreeDoors(this.data.tree)
		
		console.log(this.data.tree)
		
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
			if(cut - node_y < this.data.min_height || node_y + node_height - cut < this.data.min_height)
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
						////"color": this.getRandomColor(),
						"parent": old_node
					},
					"branch1": {
						"x": node_x,
						"y": cut,
						"width": node_width,
						"height": node_y + node_height - cut,
						////"color": this.getRandomColor(),
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
			if(cut - node_x < this.data.min_width || node_x + node_width - cut < this.data.min_width)
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
						////"color": this.getRandomColor(),
						"parent": old_node
					},
					"branch1": {
						"x": cut,
						"y": node_y,
						"width": node_x + node_width - cut,
						"height": node_height,
						////"color": this.getRandomColor(),
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
			x_offset = Math.floor(Math.random() * node.width) + 1	
			y_offset = Math.floor(Math.random() * node.height) + 1 
			
			if(node.width - x_offset - 2 < this.data.min_width)
			{
				x_offset = this.data.min_width - (node.width - x_offset - 1)
			}
			if(node.height - y_offset - 2 < this.data.min_height)
			{
				y_offset = this.data.min_height - (node.height - y_offset - 1)
			}
			
			console.log(node.x + x_offset, node.y + y_offset, node.width - x_offset - 1, node.height - y_offset - 1)
			this.makeRoom(node.x + x_offset, node.y + y_offset, node.width - x_offset - 1, node.height - y_offset - 1)
		}
		else
		{
			this.makeTreeRooms(node.branch0)
			this.makeTreeRooms(node.branch1)
		}
		return;
	},
	makeTreeDoors: function(node) {		
		console.log(node)
		if(node.x != null && node.sibling != null)
		{			
			this.makeDoor(node, node.sibling)
			return;
		}
		else
		{
			this.makeTreeDoors(node.branch0)
			this.makeTreeDoors(node.branch1)
		}
	},
	makeDoor: function(node1, node2) {
		console.log(node1, node2)
		if(node1.x == node2.x) {
			this.makeDoorVert(node1, node2)
			return
		}
		else
		{
			this.makeDoorHoriz(node1, node2)
			return
		}
	},
	makeDoorVert: function(node1, node2) {
		var x = Math.floor((Math.random() * node1.width - 1)) + node1.x + 1;
		var y = node1.y + node1.height;
		
		/*if(node1.width < node2.width)
		{
			x = (Math.random() * node1.width) + node1.x
		}
		else
		{
			x = (Math.random() * node2.width) + node2.x
		}*/
		this.makeRoom(x, y, 1, 1)
	},
	makeDoorHoriz: function(node1, node2) {
		var x = node1.x + node1.width;
		var y = Math.floor((Math.random() * node1.height - 1)) + node1.y + 1;
		
		this.makeRoom(x, y, 1, 1)
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