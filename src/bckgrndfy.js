/* let's use vanilla js? :) */
(function () {
    'use strict';

    // took it from the google closure library ... ain't i sneaky?
    // ...
    // Copyright 2006 The Closure Library Authors. All Rights Reserved.
    // Licensed under the Apache License, Version 2.0 (the "License");
    // or not! :P

    var _closure = {
        hexTripletRe_: /#(.)(.)(.)/,
        safeFloor: function(num, opt_epsilon) {
            return Math.floor(num + (opt_epsilon || 2e-15));
        },
        clamp: function(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        normalizeHex: function(hexColor) {
            if (hexColor.length === 4) { // of the form #RGB
                hexColor = hexColor.replace(_closure.hexTripletRe_, '#$1$1$2$2$3$3');
            }
            return hexColor.toLowerCase();
        },
        blend: function(rgb1, rgb2, factor) {
            factor = _closure.clamp(factor, 0, 1);

            return [
                Math.round(factor * rgb1[0] + (1.0 - factor) * rgb2[0]),
                Math.round(factor * rgb1[1] + (1.0 - factor) * rgb2[1]),
                Math.round(factor * rgb1[2] + (1.0 - factor) * rgb2[2])
            ];
        },
        hexToRgb: function(hexColor) {
            hexColor = _closure.normalizeHex(hexColor);
            var r = parseInt(hexColor.substr(1, 2), 16);
            var g = parseInt(hexColor.substr(3, 2), 16);
            var b = parseInt(hexColor.substr(5, 2), 16);

            return [r, g, b];
        }
    };

    // from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var _so = {
        componentToHex: function(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        },
        rgbToHex: function (r, g, b) {
            return '#' + _so.componentToHex(r) + _so.componentToHex(g) +
                    _so.componentToHex(b);
        },
        // quick adaptation from
        extendObj: function (obj1, obj2) {
            for (var i in obj2) {
                if (obj2.hasOwnProperty(i)) {
                    obj1[i] = obj2[i];
                }
            }
            return obj1;
        }
    };

    /*
     * delaunay.js
     * this is a wrapped version of https://github.com/ironwallaby/delaunay
     * Licensed under Apache License Version 2.0
     * original src: https://raw.githubusercontent.com/waythe/closure-low-poly-background/master/src/delaunay.js
     *
     * i rewrote all for loops for the sake of reading AND because there's no
     * need for this kind of micro-optimizations (if such)
     */

    var _delaunay = {
        EPSILON: 1.0 / 1048576.0,
        supertriangle_: function(vertices) {
            var xmin = Number.POSITIVE_INFINITY,
                ymin = Number.POSITIVE_INFINITY,
                xmax = Number.NEGATIVE_INFINITY,
                ymax = Number.NEGATIVE_INFINITY,
                i, dx, dy, dmax, xmid, ymid;

            for (i = (vertices.length - 1); i > -1; i--) {
                if (vertices[i][0] < xmin) {
                    xmin = vertices[i][0];
                }
                if (vertices[i][0] > xmax) {
                    xmax = vertices[i][0];
                }
                if (vertices[i][1] < ymin) {
                    ymin = vertices[i][1];
                }
                if (vertices[i][1] > ymax) {
                    ymax = vertices[i][1];
                }
            }

            dx = xmax - xmin;
            dy = ymax - ymin;
            dmax = Math.max(dx, dy);
            xmid = xmin + dx * 0.5;
            ymid = ymin + dy * 0.5;

            return [
                [xmid - 20 * dmax, ymid - dmax],
                [xmid, ymid + 20 * dmax],
                [xmid + 20 * dmax, ymid - dmax]
            ];
        },
        circumcircle_: function(vertices, i, j, k) {
            var x1 = vertices[i][0],
                y1 = vertices[i][1],
                x2 = vertices[j][0],
                y2 = vertices[j][1],
                x3 = vertices[k][0],
                y3 = vertices[k][1],
                fabsy1y2 = Math.abs(y1 - y2),
                fabsy2y3 = Math.abs(y2 - y3),
                xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

            /* Check for coincident points */
            if (fabsy1y2 < _delaunay.EPSILON && fabsy2y3 < _delaunay.EPSILON) {
                throw new Error('Eek! Coincident points!'); // TODO why throw?
            }

            if (fabsy1y2 < _delaunay.EPSILON) {
                m2 = -((x3 - x2) / (y3 - y2));
                mx2 = (x2 + x3) / 2.0;
                my2 = (y2 + y3) / 2.0;
                xc = (x2 + x1) / 2.0;
                yc = m2 * (xc - mx2) + my2;
            } else if (fabsy2y3 < _delaunay.EPSILON) {
                m1 = -((x2 - x1) / (y2 - y1));
                mx1 = (x1 + x2) / 2.0;
                my1 = (y1 + y2) / 2.0;
                xc = (x3 + x2) / 2.0;
                yc = m1 * (xc - mx1) + my1;
            } else {
                m1 = -((x2 - x1) / (y2 - y1));
                m2 = -((x3 - x2) / (y3 - y2));
                mx1 = (x1 + x2) / 2.0;
                mx2 = (x2 + x3) / 2.0;
                my1 = (y1 + y2) / 2.0;
                my2 = (y2 + y3) / 2.0;
                xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
                yc = (fabsy1y2 > fabsy2y3) ?
                    m1 * (xc - mx1) + my1 :
                    m2 * (xc - mx2) + my2;
            }

            dx = x2 - xc;
            dy = y2 - yc;

            return {
                i: i,
                j: j,
                k: k,
                x: xc,
                y: yc,
                r: dx * dx + dy * dy
            };
        },
        dedup_: function(edges) {
            var i, a, b, m, n,
                j = edges.length;

            while (j > 0) {
                b = edges[--j];
                a = edges[--j];

                i = j;
                while (i > 0) {
                    n = edges[--i];
                    m = edges[--i];

                    if ((a === m && b === n) || (a === n && b === m)) {
                        edges.splice(j, 2);
                        edges.splice(i, 2);
                        break;
                    }
                }
            }
        },
        triangulate: function(vertices, key) {
            var n = vertices.length,
                i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

            /* Bail if there aren't enough vertices to form any triangles. */
            if (n < 3) {
                return [];
            }

            /* Slice out the actual vertices from the passed objects. (Duplicate the
             * array even if we don't, though, since we need to make a supertriangle
             * later on!) */
            vertices = vertices.slice(0);

            if (key) {
                for (i = (n - 1); i > -1; i--) {
                    vertices[i] = vertices[i][key];
                }
            }

            /* Make an array of indices into the vertex array, sorted by the
             * vertices' x-position. */
            indices = new Array(n);

            for (i = (n - 1); i > -1; i--) {
                indices[i] = i;
            }

            indices.sort(function(i, j) {
                return vertices[j][0] - vertices[i][0];
            });

            /* Next, find the vertices of the supertriangle (which contains all other
             * triangles), and append them onto the end of a (copy of) the vertex
             * array. */
            st = _delaunay.supertriangle_(vertices);
            vertices.push(st[0], st[1], st[2]);

            /* Initialize the open list (containing the supertriangle and nothing
             * else) and the closed list (which is empty since we havn't processed
             * any triangles yet). */
            open = [_delaunay.circumcircle_(vertices, n + 0, n + 1, n + 2)];
            closed = [];
            edges = [];

            /* Incrementally add each vertex to the mesh. */
            for (i = (indices.length - 1); i > -1; i--) {
                edges.length = 0;
                c = indices[i];

                /* For each open triangle, check to see if the current point is
                 * inside it's circumcircle. If it is, remove the triangle and add
                 * it's edges to an edge list. */
                for (j = (open.length - 1); j > -1; j--) {
                    /* If this point is to the right of this triangle's circumcircle,
                     * then this triangle should never get checked again. Remove it
                     * from the open list, add it to the closed list, and skip. */
                    dx = vertices[c][0] - open[j].x;
                    if (dx > 0.0 && dx * dx > open[j].r) {
                        closed.push(open[j]);
                        open.splice(j, 1);
                        continue;
                    }

                    /* If we're outside the circumcircle, skip this triangle. */
                    dy = vertices[c][1] - open[j].y;
                    if (dx * dx + dy * dy - open[j].r > _delaunay.EPSILON) {
                        continue;
                    }

                    /* Remove the triangle and add it's edges to the edge list. */
                    edges.push(
                        open[j].i, open[j].j,
                        open[j].j, open[j].k,
                        open[j].k, open[j].i
                    );
                    open.splice(j, 1);
                }

                /* Remove any doubled edges. */
                _delaunay.dedup_(edges);

                /* Add a new triangle for each edge. */
                j = edges.length;
                while (j > 0) {
                    b = edges[--j];
                    a = edges[--j];
                    open.push(_delaunay.circumcircle_(vertices, a, b, c));
                }
            }

            /* Copy any remaining open triangles to the closed list, and then
             * remove any triangles that share a vertex with the supertriangle,
             * building a list of triplets that represent triangles. */
            for (i = (open.length - 1); i > -1; i--) {
                closed.push(open[i]);
            }
            open.length = 0;

            for (i = (closed.length - 1); i > -1; i--) {
                if (closed[i].i < n && closed[i].j < n && closed[i].k < n) {
                    open.push(closed[i].i, closed[i].j, closed[i].k);
                }
            }
            /* Yay, we're done! */
            return open;
        },
        contains: function(tri, p) {
            /* Bounding box test first, for quick rejections. */
            if ((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
                (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
                (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
                (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1])) {
                return null;
            }

            var a = tri[1][0] - tri[0][0],
                b = tri[2][0] - tri[0][0],
                c = tri[1][1] - tri[0][1],
                d = tri[2][1] - tri[0][1],
                i = a * d - b * c;

            /* Degenerate tri. */
            if (i === 0.0) {
                return null;
            }

            var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
                v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

            /* If we're outside the tri, fail. */
            if (u < 0.0 || v < 0.0 || (u + v) > 1.0) {
                return null;
            }
            return [u, v];
        }
    };

    /*
     * lowpolybg.js
     * Licensed under Apache License Version 2.0
     * Original: https://raw.githubusercontent.com/waythe/closure-low-poly-background/master/src/lowpolybg.js
     */

    var DEFAULT_PALETTE = {
        // Use the palette from ColorBrewer colors for chroma.js

        // sequential
        'OrRd': ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        'PuBu': ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        'BuPu': ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        'Oranges': ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        'BuGn': ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        'YlOrBr': ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        'YlGn': ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        'Reds': ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        'RdPu': ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        'Greens': ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        'YlGnBu': ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        'Purples': ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        'GnBu': ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        'Greys': ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        'YlOrRd': ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        'PuRd': ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        'Blues': ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        'PuBuGn': ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],

        // diverging
        'Spectral': ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        'RdYlGn': ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        'RdBu': ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        'PiYG': ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        'PRGn': ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        'RdYlBu': ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        'BrBG': ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        'RdGy': ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        'PuOr': ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    };

    var defaultOpts = {
        width: 400, // Width of the generated canvas
        height: 200, // Height of the generated canvas
        cellSize: 30, // Expect size of triangle blocks, actual size will be randomized by variance parameter
        variance: 0.75, // Defined how much to randomize the block size
        palette: DEFAULT_PALETTE, // Palette of the canvas, this directly influence the generated result, by default we use ColorBrewer for chroma.js
        shareColor: true, // If set to true, x and y will share the same palette. Recommend to keep it 'true', using different palette sometime will make the graph too messy.
        lineWidth: 1, // Line width of the triangles,
        maxSteps: 10,
        distributed: true,
        algorithm: 'delaunay' // voronoi
    };

    // ------------------------------------------------------------------------
    // default color and polygonal functions, without "this"

    var getGravityCenter_ = function (vertices) {
        var t = vertices.length,
            x = 0,
            y = 0;

        for (var i = 0; i < t; i++) {
            x += vertices[i][0];
            y += vertices[i][1];
        }

        return [_closure.safeFloor(x / t), _closure.safeFloor(y / t)];
    };

    var getColorsFromHash_ = function (params) {
        if (params.palette instanceof Array) {
            return params.palette[_closure.safeFloor(Math.random() * params.palette.length)];
        }
        var keys = Object.keys(params.palette);
        return params.palette[keys[_closure.safeFloor(Math.random() * keys.length)]];
    };

    // ------------------------------------------------------------------------
    // now the stuff, kind-of rewritten

    var createCanvas_ = function(params) {
        var canvas = document.createElement('canvas');
        if (params.elementId) {
            canvas.id = params.elementId;
        }
        canvas.width = params.width;
        canvas.height = params.height;

        var context = canvas.getContext('2d');
        context.canvas.width = params.width;
        context.canvas.height = params.height;

        return {
            el: canvas,
            ctx: context
        };
    };

    var draw_ = function(params) {
        if (params.algorithm === 'delaunay') {
            return drawDelaunay_(params);
        }
        return drawVoronoi_(params);
    };

    var drawDelaunay_ = function (params) {
        var canvasObj = createCanvas_(params),
            context = canvasObj.ctx;

        for (var i = 0; i < params.triangles.length; i++) {
            var triangle = params.triangles[i];
            context.fillStyle = context.strokeStyle = _so.rgbToHex(triangle.color[0], triangle.color[1], triangle.color[2]);
            context.lineWidth = params.lineWidth;
            context.beginPath();
            context.moveTo.apply(context, triangle.vertices[0]);
            context.lineTo.apply(context, triangle.vertices[1]);
            context.lineTo.apply(context, triangle.vertices[2]);
            context.fill();
            context.stroke();
        }

        return canvasObj.el;
    };

    var drawVoronoi_ = function (params) {
        var canvasObj = createCanvas_(params),
            context = canvasObj.ctx;

        if (!params.cells) {
            return canvasObj.el;
        }
        context.canvas.width = params.width;
        context.canvas.height = params.height;

        // cells
        var cells = params.cells,
            iCell = cells.length,
            cell, halfedges, nHalfedges, iHalfedge, v;

        while (iCell--) {
            cell = cells[iCell];
            context.fillStyle = context.strokeStyle = _so.rgbToHex(cell.color[0], cell.color[1], cell.color[2]);
            context.lineWidth = params.lineWidth;
            context.beginPath();
            context.moveTo(cell.vertices[0][0], cell.vertices[0][1]);
            for (var i = 0; i < cell.vertices.length; i++) {
                context.lineTo(cell.vertices[i][0], cell.vertices[i][1]);
            }
            context.fill();
            context.stroke();
        }

        return canvasObj.el;
    };

    var calculateGradientColor_ = function (params, x, y) {
        var xColor, yColor;
        //calculate x color
        var startXColorIndex = _closure.safeFloor(x / params.width * (params.xColors.length - 1));
        if (startXColorIndex < 0) {
            startXColorIndex = 0;
        }
        if (startXColorIndex >= params.xColors.length) {
            startXColorIndex = params.xColors.length - 1;
        }
        var endXColorIndex = startXColorIndex + 1;
        if (endXColorIndex >= params.xColors.length) {
            endXColorIndex = params.xColors.length - 1;
        }
        var xStep = params.width / params.xColors.length;
        var xFactor = (x % xStep) / xStep;
        xColor = _closure.blend(_closure.hexToRgb(params.xColors[startXColorIndex]), _closure.hexToRgb(params.xColors[endXColorIndex]), xFactor);

        //calculate y color
        var startYColorIndex = _closure.safeFloor(y / params.height * (params.yColors.length - 1));
        if (startYColorIndex < 0) {
            startYColorIndex = 0;
        }
        if (startYColorIndex >= params.yColors.length) {
            startYColorIndex = params.yColors.length - 1;
        }
        var endYColorIndex = startYColorIndex + 1;
        if (endYColorIndex >= params.yColors.length) {
            endYColorIndex = params.yColors.length - 1;
        }
        var yStep = params.height / params.yColors.length;
        var yFactor = (y % yStep) / yStep;
        yColor = _closure.blend(_closure.hexToRgb(params.yColors[startYColorIndex]), _closure.hexToRgb(params.yColors[endYColorIndex]), yFactor);

        return _closure.blend(xColor, yColor, 0.5);
    };

    var cellArea_ = function(cell) {
        var area = 0,
            halfedges = cell.halfedges,
            iHalfedge = halfedges.length,
            halfedge,
            p1, p2;

        while (iHalfedge--) {
            halfedge = halfedges[iHalfedge];
            p1 = halfedge.getStartpoint();
            p2 = halfedge.getEndpoint();
            area += p1.x * p2.y;
            area -= p1.y * p2.x;
        }
        area /= 2;
        return area;
    };

    var cellCentroid_ = function(cell) {
        var x = 0, y = 0,
            halfedges = cell.halfedges,
            iHalfedge = halfedges.length,
            halfedge,
            v, p1, p2;
        while (iHalfedge--) {
            halfedge = halfedges[iHalfedge];
            p1 = halfedge.getStartpoint();
            p2 = halfedge.getEndpoint();
            v = p1.x * p2.y - p2.x * p1.y;
            x += (p1.x + p2.x) * v;
            y += (p1.y + p2.y) * v;
        }
        v = cellArea_(cell) * 6;
        return {x: x / v,y: y / v};
    };

    var distance_ = function(a, b) {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    var calcParams_ = function (opts) {
        var params = {};
        params = _so.extendObj(params, defaultOpts);
        params = _so.extendObj(params, opts || {});
        params.xColors = getColorsFromHash_(params);
        if (params.shareColor) {
            params.yColors = params.xColors;
        } else {
            params.yColors = getColorsFromHash_(params);
        }
        if (params.algorithm === 'delaunay') {
            return calcParamsDelaunay_(params);
        }
        return calcParamsVoronoi_(params);
    };

    var calcParamsDelaunay_ = function (params) {
        params.points = generatePoints_(params);
        params.indices = _delaunay.triangulate(params.points);
        params.triangles = [];
        for (var index = 0; index < params.indices.length; index += 3) {
            var vertices = [params.points[params.indices[index]], params.points[params.indices[index + 1]], params.points[params.indices[index + 2]]];
            var gravityCenter = getGravityCenter_(vertices);
            params.triangles.push({
                'vertices': vertices,
                'color': calculateGradientColor_(params, gravityCenter[0], gravityCenter[1])
            });
        }
        return params;
    };

    var calcParamsVoronoi_ = function (params) {
        var voronoi = new Voronoi();  // jshint ignore:line
        var margin = 0.01;
        var bbox = {xl: 0, xr: params.width, yt: 0, yb: params.height};
        var totalSites = 800;
        var sites = [];
        var diagram, cells, iCell, cell, i;

        var xmargin = params.width * margin,
            ymargin = params.height * margin,
            xo = xmargin,
            dx = params.width - xmargin * 2,
            yo = ymargin,
            dy = params.height - ymargin * 2;

        if (params.distributed) {

            params.maxSteps = (typeof params.maxSteps === 'number' && params.maxSteps <= 15) ? params.maxSteps : 15;

            for (i = 0; i < totalSites; i++) {
                sites.push({
                    x: Math.round((xo + Math.random() * dx) * 10) / 10,
                    y: Math.round((yo + Math.random() * dy) * 10) / 10
                });
            }

            var doTheMath = function(_sites, step, again) {

                var _diagram = voronoi.compute(_sites, bbox),
                    _cells = _diagram.cells,
                    _iCell = _cells.length,
                    _cell, _site, _dist, rn;

                _sites.length = 0;

                var p = 1 / _iCell * 0.1;

                while (_iCell--) {
                    _cell = _cells[_iCell];
                    rn = Math.random();
                    // probability of apoptosis
                    if (rn < p) {
                        continue;
                    }

                    _site = cellCentroid_(_cell);
                    _dist = distance_(_site, _cell.site);
                    again = again || _dist > 1;
                    // don't relax too fast
                    if (_dist > 2) {
                        _site.x = (_site.x + _cell.site.x) / 2;
                        _site.y = (_site.y + _cell.site.y) / 2;
                    }
                    // probability of mytosis
                    if (rn > (1 - p)) {
                        _dist /= 2;
                        _sites.push({
                            x: _site.x + (_site.x - _cell.site.x) / _dist,
                            y: _site.y + (_site.y - _cell.site.y) / _dist,
                        });
                    }
                    _sites.push(_site);
                }
                return (again && step < params.maxSteps) ? doTheMath(_sites, step + 1, again) : _sites;
            };

            sites = doTheMath(sites, 0, false);

        } else {
            for (i = 0; i < totalSites; i++) {
                sites.push({
                    x: xo + Math.random() * dx + Math.random() / dx,
                    y: yo + Math.random() * dy + Math.random() / dy
                });
            }
        }

        diagram = voronoi.compute(sites, bbox);

        params.cells = [];

        cells = diagram.cells;
        iCell = cells.length;
        var halfedges, nHalfedges, iHalfedge, v;

        while (iCell--) {
            var vertices = [];
            cell = cells[iCell];
            halfedges = cell.halfedges;
            nHalfedges = halfedges.length;
            if (nHalfedges) {
                v = halfedges[0].getStartpoint();
                vertices.push([v.x, v.y]);
                for (iHalfedge = 0; iHalfedge < nHalfedges; iHalfedge++) {
                    v = halfedges[iHalfedge].getEndpoint();
                    vertices.push([v.x, v.y]);
                }
                var gravityCenter = getGravityCenter_(vertices);
                params.cells.push({
                    'vertices': vertices,
                    'color': calculateGradientColor_(params, gravityCenter[0], gravityCenter[1])
                });
            }
        }

        return params;
    };

    var generatePoints_ = function(params) {
        // calculate how many cells we're going to have on each axis (pad by 2 cells on each edge)
        params.xCellAmount = _closure.safeFloor((params.width + 4 * params.cellSize) / params.cellSize);
        params.yCellAmount = _closure.safeFloor((params.height + 4 * params.cellSize) / params.cellSize);

        // figure out the bleed widths to center the grid
        params.xOutBounds = ((params.xCellAmount * params.cellSize) - params.width) / 2;
        params.yOutBounds = ((params.yCellAmount * params.cellSize) - params.height) / 2;

        // how much can out points wiggle (+/-) given the cell padding?
        params.variance = params.cellSize * params.variance / 2;

        var points = [];
        for (var i = (params.xOutBounds * -1); i < params.width + params.xOutBounds; i += params.cellSize) {
            for (var j = -params.yOutBounds; j < params.height + params.yOutBounds; j += params.cellSize) {
                var x = i + params.cellSize / 2 + Math.random() * params.variance * 2 - params.variance;
                var y = j + params.cellSize / 2 + Math.random() * params.variance * 2 - params.variance;
                points.push([_closure.safeFloor(x), _closure.safeFloor(y)]);
            }
        }
        return points;
    };

    var bckgrndfy = function (opts) {
        var params = calcParams_(opts);
        return draw_(params);
    };

    /* quickly borrower from fastclick! :) */
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function() {
            return bckgrndfy;
        });
    /* jshint ignore:start */
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = bckgrndfy;
        module.exports.bckgrndfy = bckgrndfy;
    /* jshint ignore:end */
    } else {
        window.bckgrndfy = bckgrndfy;
    }

}());
