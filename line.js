var line = function(x, y) {
    var points = new Array()
    if(Math.abs(x) >= Math.abs(y)) {
        if(x > 0) {
            for(var lx = 0, ly = 0; lx <= x; lx++, ly += y / x) {
                points.push({lx, ly})
            }
        } else if(x < 0) {
            for(var lx = 0, ly = 0; lx >= x; lx--, ly -= y / x) {
                points.push({lx, ly})
            }
        }
    } else {
        if(y > 0) {
            for(var lx = 0, ly = 0; ly <= y; ly++, lx += x / y) {
                points.push({lx, ly})
            }
        } else if(y < 0) {
            for(var lx = 0, ly = 0; ly >= y; ly--, lx -= x / y) {
                points.push({lx, ly})
            }
        }
    }
    return points
}

module.exports = line
