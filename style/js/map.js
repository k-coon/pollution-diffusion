var map = {
    paper: {},
    init: function() {
        this.$paper = $('#map-container');
        this.paper = Raphael('map-container', this.$paper.width(), this.$paper.height());
        this.loadMap();
        this.drawRiver();
        return this.paper;
    },
    loadMap: function() {
        this.paper.image('./style/img/ay_wpd_map.png', 1, 0, this.$paper.width(), this.$paper.height());
    },
    drawRiver: function() {
        var r = wpdInfo.river,
            path, i, j;
        for (i = 0; i < r.length; i++) {
            path = '';
            for (j = 0; j < r[i].length; j++) {
                if (j) {
                    path += 'L';
                } else {
                    path += 'M';
                }
                path += r[i][j].x + ',' + r[i][j].y;
            }
            if (path) {
                this.paper.path(path).attr({
                    'stroke': '#3F47CC',
                    'stroke-width': 3
                });
            }
        }
    },
    drawSource: function() {
        var p = wpdInfo.pollute;
        this.paper.circle(p.source.x, p.source.y, 4).attr({
            'fill': '#FFFFFF',
            'stroke-width': 0
        });
        this.paper.path('M' + p.source.x + ',' + p.source.y +
            'L' + p.direct.x + ',' + p.direct.y).attr({
            'stroke-dasharray': '--',
            'arrow-end': 'open',
            'stroke': '#FFFFFF'
        });
    },
    drawDiff: function(points, r, e) {
        var path = '', i;
        for (i = 0; i < points.length; i++) {
            if (i) {
                path += 'L';
            } else {
                path += 'M';
            }
            path += points[i].x + ',' + points[i].y;
        }
        path += 'Z';
        return this.paper.path(path).attr({  
            'fill': r + '-#f00:0-#0f0:' + e, 
            'fill-opacity': 0.3,
            'stroke-width': 0
        });
    },
    graphCor: function(event) {
        var cor = {},
            offset = this.$paper.offset(),
            e = event || window.event,
            pos, zoom;
        if (e.offsetX) {
            cor.x = e.offsetX;
            cor.y = e.offsetY;
        } else {
            cor.x = e.pageX - offset.left;
            cor.y = e.pageY - offset.top;
        }
        if (this.pan) {
            pos = this.pan.getCurPos();
            zoom = 1 - this.pan.getCurZoom() * 0.1;
            cor.x = cor.x * zoom + pos.x + 0.3;
            cor.y = cor.y * zoom + pos.y + 0.3;
        }
        return cor;
    }
};