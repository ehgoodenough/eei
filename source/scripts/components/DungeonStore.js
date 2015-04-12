var BinaryHeap = require("yabh")
var Phlux = require("<scripts>/utilities/Phlux")

var DungeonStore = Phlux.createStore({
    initiateStore: function() {
		var isComplete = false
		while(!isComplete)
		{
			try
			{
				this.data = {
					width: 60,
					height: 45,
					tiles: {},
					rooms: [],
					min_width: 10,
					min_height: 7,
					adventurer_x: 0,
					adventurer_y: 0
				}
				var size = 3
				var room_width = WIDTH - 1
				var room_height = HEIGHT - 1

				//empty tree
				var base_tree = {
					"x": 0,
					"y": 0,
					"width": this.data.width,
					"height": this.data.height
				}

				this.data.tree = base_tree

				//partition into spaces
				this.data.tree = this.partition(this.data.tree)
				//draw rooms inside spaces
				this.makeTreeRooms(this.data.tree)

				//figure out which rooms to connect
				var rooms_to_connect = []
				rooms_to_connect = this.euler(this.data.tree, rooms_to_connect)
				for(index in rooms_to_connect)
				{
					this.data.rooms[index] = this.getBoundaries(rooms_to_connect[index])
				}
				
				var start_room = this.getBoundaries(rooms_to_connect[0])

				this.data.adventurer_x = Math.floor((start_room.min_x + start_room.max_x) / 2)
				this.data.adventurer_y = Math.floor((start_room.min_y + start_room.max_y) / 2)

				//connect rooms
				this.makeTreeDoors(rooms_to_connect)
				this.trigger()
				isComplete = true
			}
			catch(error)
			{
				if(error == -1)
				{
                    //lol not catching this
				}
			}
		}
    },
    getRooms: function() {
        return this.data.rooms
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
					//"color": this.getRandomColor(),
					"parent": old_node
				},
				"branch1": {
					"x": node_x,
					"y": cut,
					"width": node_width,
					"height": node_y + node_height - cut,
					//"color": this.getRandomColor(),
					"parent": old_node
				}
			}

			node.branch0.sibling = node.branch1
			node.branch1.sibling = node.branch0

			node.branch0 = this.partition_horizontal(node.branch0)
			node.branch1 = this.partition_horizontal(node.branch1)
		}

		return node;
	},
	partition_horizontal: function(node) {
		var cut_offset = 4
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
					//"color": this.getRandomColor(),
					"parent": old_node
				},
				"branch1": {
					"x": cut,
					"y": node_y,
					"width": node_x + node_width - cut,
					"height": node_height,
					//"color": this.getRandomColor(),
					"parent": old_node
				}
			}
			node.branch0.sibling = node.branch1
			node.branch1.sibling = node.branch0

			node.branch0 = this.partition_vertical(node.branch0)
			node.branch1 = this.partition_vertical(node.branch1)
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
			if(node.width == this.data.width && node.height == this.data.height)
			{
				throw -1
			}

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

		//if not aligned at all
		if((range2.min_x > range1.max_x) || (range1.min_x > range2.max_x))
		{
			x_mis = true
		}
		if((range2.min_y > range1.max_y) || (range1.min_y > range2.max_y))
		{
				y_mis = true
		}
		if(x_mis && y_mis)
		{
			//needs corner
			this.makeDoorCorner(node1, node2, range1, range2)
		}
		else
		{
			//connect -> horizontal
			if(x_mis)
			{
				this.makeDoorHoriz(node1, node2, range1, range2)
			}
			//connect v^ vertical
			else
			{
				this.makeDoorVert(node1, node2, range1, range2)
			}
		}
	},
	makeDoorCorner: function(node1, node2, range1, range2){
		var cen_x1, cen_x2, cen_y1, cen_y2, cen_x, cen_y

		cen_x1 = Math.floor((range1.min_x + range1.max_x) / 2)
		cen_x2 = Math.floor((range2.min_x + range2.max_x) / 2)
		cen_y = Math.floor((range2.min_y + range1.max_y) / 2)

		//down from first
		this.makeRoom(cen_x1, range1.max_y, 1, cen_y - range1.max_y)
		//up from second
		this.makeRoom(cen_x2, cen_y, 1, range2.min_y - cen_y)
		//connect in middle
		//this.makeRoom(cen_x2, cen_y, Math.abs(cen_x2 - cen_x1) + 1, 1)
		if(range1.max_y < range2.min_y)
			{
				cen_y = Math.floor((range2.min_y + range1.max_y) / 2)

				//down from first
				this.makeRoom(cen_x1, range1.max_y, 1, cen_y - range1.max_y)
				//up from second
				this.makeRoom(cen_x2, cen_y, 1, range2.min_y - cen_y)
				//connect in middle
				this.makeRoom(cen_x2, cen_y, Math.abs(cen_x2 - cen_x1) + 1, 1)
			}
			//if 2 is higher
			else
			{
				cen_y = Math.floor((range2.max_y + range1.min_y) / 2)

				//down from first
				this.makeRoom(cen_x2, range2.max_y, 1, cen_y - range2.max_y)
				//up from second
				this.makeRoom(cen_x1, cen_y, 1, range1.min_y - cen_y)
				//connect in middle
				this.makeRoom(cen_x1, cen_y, Math.abs(cen_x2 - cen_x1) + 1, 1)
			}
		/*
		//connect on one y
		if(Math.random() < 0.5)
		{
			cen_x1 = Math.floor((range1.min_x + range1.max_x) / 2)
			cen_x2 = Math.floor((range2.min_x + range2.max_x) / 2)
			//if 1 is higher
			if(range1.max_y < range2.min_y)
			{
				cen_y = Math.floor((range2.min_y + range1.max_y) / 2)

				//down from first
				this.makeRoom(cen_x1, range1.max_y, 1, cen_y - range1.max_y)
				//up from second
				this.makeRoom(cen_x2, cen_y, 1, range2.min_y - cen_y)
				//connect in middle
				this.makeRoom(cen_x1, cen_y, cen_x2 - cen_x1, 1)
			}
			//if 2 is higher
			else
			{
				cen_y = Math.floor((range2.max_y + range1.min_y) / 2)

				//down from first
				this.makeRoom(cen_x2, range2.max_y, 1, cen_y - range2.max_y)
				//up from second
				this.makeRoom(cen_x1, cen_y, 1, range1.min_y - cen_y)
				//connect in middle
				this.makeRoom(cen_x2, cen_y, cen_x1 - cen_x2, 1)
			}
		}
		//connect on one x
		else
		{
			cen_y1 = Math.floor((range1.min_y + range1.max_y) / 2)
			cen_y2 = Math.floor((range2.min_y + range2.max_y) / 2)
			if(range1.max_x < range2.min_x)
			{
				cen_x = Math.floor((range2.min_x + range1.max_x) / 2)

				//left from first
				this.makeRoom(range1.max_x, cen_y1, cen_x - range1.max_x, 1)
				//right from second
				this.makeRoom(cen_x, cen_y1, range2.min_x - cen_x, 1)
				//connect in middle
				this.makeRoom(cen_x, cen_y1, 1, cen_y2 - cen_y1)
			}
			else
			{
				cen_x = Math.floor((range2.max_x + range1.min_x) / 2)

				//left from first
				this.makeRoom(range2.max_x, cen_y2, cen_x - range2.max_x, 1)
				//right from second
				this.makeRoom(cen_x, cen_y2, range1.min_x - cen_x, 1)
				//connect in middle
				this.makeRoom(cen_x, cen_y2, 1, cen_y1 - cen_y2)
			}
		}*/
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
	},
	onRestartGame: function() {
        this.initiateStore()
    },
    getTile: function(x, y) {
        return this.data.tiles[Math.floor(x) + "x" + Math.floor(y)]
    },
    getNeighboringTiles: function(point) {
        var tiles = []
        var northernTile = this.getTile(point.x, point.y - 1)
        if(northernTile !== undefined) {
            tiles.push(northernTile)
        }
        var southernTile = this.getTile(point.x, point.y + 1)
        if(southernTile !== undefined) {
            tiles.push(southernTile)
        }
        var westernTile = this.getTile(point.x - 1, point.y)
        if(westernTile !== undefined) {
            tiles.push(westernTile)
        }
        var easternTile = this.getTile(point.x + 1, point.y)
        if(easternTile !== undefined) {
            tiles.push(easternTile)
        }
        return tiles
    },
    getShortestPath: function(initial_point, final_point) {
        var path = new Array()
        var closed_points = new Object()
        var open_points = new BinaryHeap(function(point) {
            return point.score
        })
        initial_point = {
            "x": initial_point.x,
            "y": initial_point.y,
            "score": 0
        }
        final_point = {
            "x": final_point.x,
            "y": final_point.y
        }
        closed_points[initial_point.x + "x" + initial_point.y] = initial_point
        open_points.push(initial_point)
        var heuristic = function(initial_point, final_point) {
            var x = Math.abs(initial_point.x - final_point.x)
            var y = Math.abs(initial_point.y - final_point.y)
            return x + y
        }
        while(open_points.size() > 0) {
            var current_point = open_points.pop()
            if(current_point.x == final_point.x
            && current_point.y == final_point.y) {
                path.unshift(current_point)
                break;
            }
            var neighboring_tiles = this.getNeighboringTiles(current_point)
            for(var index in neighboring_tiles) {
                var neighbor_tile = neighboring_tiles[index]
                var neighbor_point = {
                    x: neighbor_tile.position.x,
                    y: neighbor_tile.position.y,
                    previous_point: current_point,
                    score: current_point.score + 1
                }
                neighbor_point.score += heuristic(neighbor_point, final_point)
                var neighbor_coords = neighbor_point.x + "x" + neighbor_point.y
                if(closed_points[neighbor_coords] === undefined) {
                    closed_points[neighbor_coords] = neighbor_point
                    open_points.push(neighbor_point)
                }
            }
        }
        if(path.length > 0) {
            while(path[0].previous_point !== undefined
            && path[0].previous_point.previous_point !== undefined) {
                var point = path[0].previous_point
                path.unshift(point)
            }
        }
        return path
    },
    isUnobstructedLine: function(initial_point, final_point) {
        var points = this.getPointLine(initial_point, final_point)
        for(var index in points) {
            var point = points[index]
            if(this.getTile(point.x, point.y) === undefined) {
                return false
            }
        }
        return true
    },
    getPointLine: function(initial_point, final_point) {
        var x = final_point.x - initial_point.x
        var y = final_point.y - initial_point.y
        var points = new Array()
        if(Math.abs(x) >= Math.abs(y)) {
            if(x > 0) {
                for(var lx = 0, ly = 0; lx <= x; lx++, ly += y / x) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            } else if(x < 0) {
                for(var lx = 0, ly = 0; lx >= x; lx--, ly -= y / x) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            }
        } else {
            if(y > 0) {
                for(var lx = 0, ly = 0; ly <= y; ly++, lx += x / y) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            } else if(y < 0) {
                for(var lx = 0, ly = 0; ly >= y; ly--, lx -= x / y) {
                    points.push({
                        "x": initial_point.x + Math.round(lx),
                        "y": initial_point.y + Math.round(ly)
                    })
                }
            }
        }
        return points
    }
})

module.exports = DungeonStore
