var wpd = wpd || {};

$(function() {
    map.init();
    wpd.simulate();
    map.drawSource();
});

wpd.simulate = function() {
    var c = result.data.c,  //前端模拟API返回值
        p = wpdInfo.pollute,
        r1 = wpdInfo.river[0],
        r2 = wpdInfo.river[1],
        p1, p2, k, b, _b, i,
        cpIndex1, cpIndex2,
        d, _d, d1, d2, x, y,
        dpIndex1, dpIndex2,
        cp1, cp2, dp1, dp2,
        f, e, rele,
        points = [];

    k = this.getSlope(p.source.x, p.source.y, p.direct.x, p.direct.y);
    if (!isFinite(k)) {
        //垂线水平
        k = 0;
        b = p.source.y;
    } else if (k !== 0) {
        //垂线垂直
        k = -1 / k;
        b = p.source.y - k * p.source.x;
    }

    //求得方向线的垂线与两岸的交点做遍历起始点
    p1 = r1[0];
    for (i = 1, len = r1.length; i < len; i++) {
        p2 = r1[i];
        if (b) {
            //非垂直
            cp1 = this.crossPoint(p1, p2, k, b);
        } else {
            cp1 = this.crossPoint(p1, p2, p.source.x);
        }
        if (cp1) {
            cpIndex1 = i;
            break;
        }
        p1 = p2;
    }
    if (!cp1) {
        cpIndex1 = 1;
        cp1 = r1[0];
    }
    p1 = r2[0];
    for (i = 1, len = r2.length; i < len; i++) {
        p2 = r2[i];
        if (b) {
            //非垂直
            cp2 = this.crossPoint(p1, p2, k, b);
        } else {
            cp2 = this.crossPoint(p1, p2, p.source.x);
        }
        if (cp2) {
            cpIndex2 = i;
            break;
        }
        p1 = p2;
    }
    if (!cp2) {
        cpIndex2 = 1;
        cp2 = r2[0];
    }

    points.push(cp1);
    points.push(cp2);

    //求得方向线最远输移距离的垂线与两岸的交点做遍历起终点

    d = Math.abs(this.getRange(p.direct, k, b));
    x = (p.direct.x - p.source.x) / d * c.length + p.source.x;
    y = (p.direct.y - p.source.y) / d * c.length + p.source.y;
    if (!k) {
        //垂线水平
        _b = y;
    } else {
        //垂线垂直
        _b = y - k * x;
    }

    p1 = r1[0];
    for (i = 1, len = r1.length; i < len; i++) {
        p2 = r1[i];
        if (_b) {
            //非垂直
            dp1 = this.crossPoint(p1, p2, k, _b);
        } else {
            dp1 = this.crossPoint(p1, p2, p.source.x);
        }
        if (dp1) {
            dpIndex1 = i;
            break;
        }
        p1 = p2;
    }

    if (!dp1) {
        d1 = Math.abs(this.getRange(r1[0], k, _b));
        d2 = Math.abs(this.getRange(r1[r1.length - 1], k, _b));
        if (d1 > d2) {
            dpIndex1 = r1.length - 1;
            dp1 = r1[r1.length - 1];
        } else {
            dpIndex1 = 1;
            dp1 = r1[0];
        }
    }

    p1 = r2[0];
    for (i = 1, len = r2.length; i < len; i++) {
        p2 = r2[i];
        if (_b) {
            //非垂直
            dp2 = this.crossPoint(p1, p2, k, _b);
        } else {
            dp2 = this.crossPoint(p1, p2, p.source.x);
        }
        if (dp2) {
            dpIndex2 = i;
            break;
        }
        p1 = p2;
    }
    if (!dp2) {
        d1 = Math.abs(this.getRange(r2[0], k, _b));
        d2 = Math.abs(this.getRange(r2[r2.length - 1], k, _b));
        if (d1 > d2) {
            dpIndex2 = r2.length - 1;
            dp2 = r2[r2.length - 1];
        } else {
            dpIndex2 = 1;
            dp2 = r2[0];
        }
    }

    // 计算需绘制的河道区域
    if (dpIndex2 > cpIndex2) {
        for (i = cpIndex2; i < dpIndex2; i++) {
            points.push(r2[i]);
        }
    } else {
        for (i = cpIndex2; i > dpIndex2; i--) {
            points.push(r2[i - 1]);
        }
    }
    points.push(dp2);
    points.push(dp1);

    if (dpIndex1 > cpIndex1) {
        for (i = dpIndex1 - 1; i >= cpIndex1; i--) {
            points.push(r1[i]);
        }
    } else {
        for (i = cpIndex1; i > dpIndex1; i--) {
            points.push(r1[i - 1]);
        }
    }

    r = this.getAngle(p.source.x, p.source.y, p.direct.x, p.direct.y);
    if (p.direct.x > p.source.x) {
        r = 360 - r;
    } else {
        r = 180 - r;
    }
    rele = map.drawDiff(points, r, c.length);
    
    // 绑定事件
    rele.mousemove(function(e) {
        var text, d;
        d = Math.abs(wpd.getRange(map.graphCor(e), k, b));
        // console.log(d);
        text = c[Math.round(d)];
        $('.main-body-conc').text('浓度：' + text);
    }).mouseout(function() {
        $('.main-body-conc').text('浓度');
    });
};

/**
 *求法线与河道交点
 */
wpd.crRiver = function(r, k, b, p) {
    var p1, p2, i,
        c = {};
    p1 = r[0];
    for (i = 1, len = r.length; i < len; i++) {
        p2 = r[i];
        if (b) {
            //非垂直
            c.p = this.crossPoint(p1, p2, k, b);
        } else {
            c.p = this.crossPoint(p1, p2, p.source.x);
        }
        if (c.p) {
            c.dex = i;
            break;
        }
        p1 = p2;
    }
    //未找到则选取第一点作为起点
    if (!c.p) {
        c.dex = 1;
        c.p = r[0];
    }
    return c;
};

/**
 *求两点间直线斜率
 */
wpd.getSlope = function(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
};

/**
 *求向量乘
 */
wpd.VMul = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 *求角度
 */
wpd.getAngle = function(x1, y1, x2, y2){
    var _x = x2 - x1,
        _y = y2 - y1;
    return 360 * Math.atan(_y / _x) / (2 * Math.PI);
}

/**
 * 求点P到直线y = kx + b或者x=k的距离
 */
wpd.getRange = function(p, k, b) {
    var d = (k * p.x - p.y + b) / Math.sqrt(k * k + 1);
    return d;
};

/**
 *求直线y = kx + b或者x=k与L(P1, P2)的交点
 */
wpd.crossPoint = function(p1, p2, k, b) {
    var k1 = this.getSlope(p1.x, p1.y, p2.x, p2.y),
        b1 = p1.y - k1 * p1.x,
        x, y,
        v1, v2;
    if (b) {
        //非垂直
        if (k1 === k) {
            return false;
        }
        x = (b - b1) / (k1 - k);
        y = k * x + b;
    } else {
        //垂直:第三个参数k为x值
        x = k;
        y = k1 * x + b1;
    }
    v1 = {
        x: p1.x - x,
        y: p1.y - y
    };
    v2 = {
        x: p2.x - x,
        y: p2.y - y
    };
    if (this.VMul(v1, v2) < 0) {
        return {
            x: x,
            y: y
        };
    }
    return false;
};

/**
 *渐变色生成
 *@param i 当前步数
 *@param n 步长
 */
wpd.genColor = function(i, n) {
    var r, g, b,
        rh = 255, gh = 0, bh = 0, // RGB(255, 0, 0)--RED
        rl = 0, gl = 255, bl = 0; // RGB(0, 255, 0)--GREEN
    r = Math.ceil(rh + (rl - rh) / n * i);
    g = Math.ceil(gh + (gl - gh) / n * i);
    b = Math.ceil(bh + (bl - bh) / n * i);
    return 'RGB(' + r + ',' + g + ',' + b + ')';
};