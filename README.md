# Backgroundify!

Backgroundify! (or bckgrndfy) is an attempt to create a pleasant, no-so-fancy-featured (but loosely coupled in some aspects) background generator for the browser.

This project is a fork of [closure-low-poly-background](https://github.com/waythe/closure-low-poly-background), which uses Google's Closure library aaaaaand I wanted something more lightweight, Vanilla JS (3,7Kb minified + gzipped).

There are many others (IMHO) out there, being [Trianglify](http://qrohlf.com/trianglify/) the best one. Yes, it's the best. I just couldn't use it (which led me to do Backgroundify!) because of its GPL license. Don't get me wrong, I love GPL. I use mostly GPL / free software in my Linux (GPL) box. If you won't have any trouble about using GPL, **I strongly advise you** to use [Trianglify](http://qrohlf.com/trianglify/) :)

## Quick demo output

![image](https://github.com/vltr/bckgrndfy/raw/master/example.png)

## Installing

Use `bower` to install it.

```
$ bower install bckgrndfy --save
```

Well, you can install using `npm` too, but the main target is the browser (well ...).

```
$ npm install bckgrndfy --save
```

## Usage

Your HTML file:

```html
<!DOCTYPE html>
<html lang=en>
    <head>
        <meta charset=utf-8>
    </head>
    <body>
        <script src="../path/to/bower_componentes/dist/bckgrndfy.min.js"></script>
        <script src="demo.js"></script>
    </body>
</html>
```

Your `demo.js` file:

```js
window.onload = function() {

    var body = document.getElementsByTagName('body')[0];
    var canvas = bckgrndfy({
        width: 800,
        height: 600,
        cellSize: 55,
        variance: 0.75
    });
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.position = 'absolute';
    canvas.style.overflow = 'hidden';
    body.appendChild(canvas);
};
```

Checkout the demo, which uses [Please JS](http://www.checkman.io/please/) to generate color schemas on the fly! Oh, use `bower` before.

## Options

```js
{
    width: 400, // Width of the generated canvas
    height: 200, // Height of the generated canvas
    cellSize: 30, // Expect size of triangle blocks, actual size will be randomized by variance parameter
    variance: 0.75, // Defined how much to randomize the block size
    palette: /* from chroma */ DEFAULT_PALETTE, // Palette of the canvas, this directly influence the generated result, by default we use ColorBrewer for chroma.js
    shareColor: true, // If set to true, x and y will share the same palette. Recommend to keep it 'true', using different palette sometime will make the graph too messy.
    lineWidth: 1 // Line width of the triangles
}
```

## Build

First, install all necessary packages from npm:

```
$ npm i -l
```

Then, just run `grunt` to create `dist/bckgrndfy.min.js`.

## Borrowed from (and original credits):

* https://github.com/waythe/closure-low-poly-background
* https://github.com/ironwallaby/delaunay
* https://github.com/gka/chroma.js/blob/master/src/colors/colorbrewer.coffee

## License
Apache License Version 2.0

## Browser Compatibility

Tested in these browsers (which means an image have appear and no JS warning was given):

- Chrom[e|ium] 47.0.2526.106 (under Arch Linux)
- Firefox 43.0.1 (under Arch Linux)
- Microsoft Edge[HTML?] 13.10586 (under Windows 10 - virtualized)
- Opera 34.0.2036.25 (under Arch Linux)
