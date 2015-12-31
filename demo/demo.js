window.onload = function() {

    var scheme1 = Please.make_scheme(Please.HEX_to_HSV('11a9a4'), {  // jshint ignore:line
        scheme_type: 'mono',
        format: 'hex'
    });

    var scheme2 = Please.make_scheme(Please.HEX_to_HSV('00557e'), {  // jshint ignore:line
        scheme_type: 'mono',
        format: 'hex'
    });

    var complete_schema = scheme1.concat(scheme2);

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var body = document.getElementsByTagName('body')[0];
    var canvas = bckgrndfy({  // jshint ignore:line
        width: w,
        height: h,
        palette: [complete_schema,],
        lineWidth: 0,
        algorithm: 'delaunay', // or 'voronoi'
        // only for voronoi
        distributed: true,
        maxSteps: 15,
        // only for delaunay
        cellSize: 40,
        variance: 0.25,
    });
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.position = 'absolute';
    canvas.style.overflow = 'hidden';
    body.appendChild(canvas);
};
