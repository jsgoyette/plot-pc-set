/*
 * plot-pc-set.js - Draw and animate pitch class sets.
 * https://github.com/jsgoyette/plot-pc-set
 * Copyright (c) 2012 Jeremiah Goyette
 * Under MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function (document, window) {
  'use strict';

  function roundNumber(n, dec) {
    return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  var sg = window.setGraph = function (id) {

    var exports = {},
      paper = null,  // Raphael object
      active = false,
      pcarr = [], // array of pcobj
      m = 12, // modulus
      r = 180, // radius of big circle
      p = 30, // padding between circle and edge of canvas
      csize = 2 * (r + p), // container size
      tsize = 5, // tick size
      dsize = 8, // dot size
      asteps = 50, // num of steps in animation (10ms each)
      animint = 15, // time in ms between steps
      dotclick = function () {
        return false;
      };

    // convert pc to range between 0 and mod
    function modularize(pc) {
      while (pc >= m) { pc -= m; }
      while (pc < 0) { pc += m; }
      return roundNumber(pc, 2);
    }

    // calculate pc position
    function pcPos(pc) {
      var cos = Math.cos(pc / m * 2 * Math.PI);
      var sin = Math.sin(pc / m * 2 * Math.PI);
      return {
        'x': Math.floor(r * sin + r + p),
        'y': Math.floor(-1 * r * cos + r + p)
      };
    }

    //determine dot size for multisets
    function getdotsizes() {
      var i, j, c,
        sizes = new Array(pcarr.length);
      for (i = pcarr.length-1; i >= 0; i--) {
        c = 0;
        for (j = pcarr.length-1; j >= 0; j--) {
          if (j > i && pcarr[i].pc == pcarr[j].pc) {
            sizes[i] = sizes[j];
            break;
          }
          if (pcarr[i].pc == pcarr[j].pc) {
            c++;
          }
        }
        sizes[i] = sizes[i] || Math.sqrt(c) * dsize;
      }
      return sizes;
    }

    function positiondots() {
      var i, sizes = getdotsizes();
      for (i = pcarr.length-1; i >= 0; i--) {
        // set the dot position
        var pos = pcPos(pcarr[i].pc);
        pcarr[i].dot.attr({cx: pos.x, cy: pos.y});
        // adjust dot size
        pcarr[i].dot.attr({r: sizes[i]});
      }
    }

    var pcobj = function (p, f) {
      p = p || 0;
      f = f || false;
      var pos = pcPos(p),
        dot = paper.circle(pos.x, pos.y, dsize);
      dot.attr({fill: 'black'});
      dot.click(dotclick);
      return {
        'pc': p,
        'fixed': f,
        'dot': dot
      };
    };

    exports.configure = function (opts) {
      m = opts.mod || m;
      r = opts.radius || r;
      p = opts.padding || p;
      csize = 2 * (r + p);
      tsize = opts.ticksize || tsize;
      dsize = opts.dotsize || dsize;
      dotclick = opts.dotclick && typeof opts.dotclick === 'function' ? opts.dotclick : dotclick;
    };

    exports.plotpcs = function (pcs, fix) {
      if (paper) {
        exports.clear(paper);
        pcarr = [];
      }
      pcs = pcs || [];
      fix = fix || 0;
      paper = new Raphael(document.getElementById(id), csize, csize);
      // make big circle
      var i,
        circle = paper.circle(r + p, r + p, r);
      circle.attr({'stroke-width': 4});
      // make ticks
      for (i = 0; i < m; i++) {
        var pos = pcPos(i);
        var dot = paper.circle(pos.x, pos.y, tsize);
        dot.attr({fill: 'white'});
      }
      // make pcarr, which is array of pcobj
      for (i = pcs.length-1; i >= 0; i--) {
        var f = (i >= fix) ? false : true;
        var obj = pcobj(pcs[i], f);
        pcarr.unshift(obj);
      }
      positiondots();
    };

    exports.getpcs = function () {
      var i, pcs = [];
      for (i = pcarr.length-1; i >= 0; i--) {
        pcs.unshift(pcarr[i].pc);
      }
      return pcs;
    };

    exports.transpose = function (tn, callback) {
      for (var i = pcarr.length-1; i >= 0; i--) {
        if (!pcarr[i].fixed)
          pcarr[i].pc = modularize(pcarr[i].pc + tn);
      }
      positiondots();
      if (callback && typeof callback === 'function') {
        callback();
      }
    };

    exports.animTranspose = function (tn, animcallback, callback) {
      if (active) return;
      active = true;
      var i, adj, counter = 0,
        tmp_pcs = exports.getpcs();
      (function step() {
        adj = (tn * counter / asteps);
        for (i = pcarr.length-1; i >= 0; i--) {
          if (!pcarr[i].fixed)
            pcarr[i].pc = modularize(tmp_pcs[i] + adj);
        }
        positiondots();
        if (animcallback && typeof animcallback === 'function') {
          animcallback();
        }
        if (counter < asteps) {
          window.setTimeout(function() {
            step();
          }, animint);
        } else {
          active = false;
          if (callback && typeof callback === 'function') {
            callback();
          }
        }
        counter++;
      }());
    };

    exports.invert = function (index, callback) {
      for (var i = pcarr.length-1; i >= 0; i--) {
        if (!pcarr[i].fixed)
          pcarr[i].pc = modularize(index - pcarr[i].pc);
      }
      positiondots();
      if (callback && typeof callback === 'function') {
        callback();
      }
    };

    exports.animInvert = function (index, animcallback, callback) {
      if (active) return;
      active = true;
      var counter = 0,
        tmp_pcs = exports.getpcs();
      (function step() {
        var i, pos, sizes, stoe,
          adj = counter/asteps;
        for (i = pcarr.length-1; i >= 0; i--) {
          if (!pcarr[i].fixed) {
            // ordered interval from start to end
            stoe = modularize(index - 2 * tmp_pcs[i]);
            // go the shortest route
            if (stoe > m / 2) stoe -= m;
            pcarr[i].pc = modularize(tmp_pcs[i] + (adj * stoe));
            pos = pcPos(pcarr[i].pc);
            //set the circle position
            pcarr[i].dot.attr({cx: pos.x, cy: pos.y});
          }
        }
        sizes = getdotsizes();
        for (i = pcarr.length-1; i >= 0; i--) {
          pcarr[i].dot.attr({r: sizes[i]});
        }
        if (animcallback && typeof animcallback === 'function') {
          animcallback();
        }
        if (counter < asteps) {
          window.setTimeout(function() {
            step();
          }, animint);
        } else {
          active = false;
          if (callback && typeof callback === 'function') {
            callback();
          }
        }
        counter++;
      }());
    };

    exports.animDirect = function (transform, index, callback) {
      if (active) return;
      active = true;
      var i, j, c, t,
        counter = 0,
        spos = [],
        epos = [];
      for (i = pcarr.length-1; i >= 0; i--) {
        c = 0;
        if (!pcarr[i].fixed) {
          spos.unshift(pcPos(pcarr[i].pc));
          if (transform == 'invert')
              epos.unshift(pcPos(modularize(index-pcarr[i].pc)));
          else
              epos.unshift(pcPos(modularize(index+pcarr[i].pc)));
        }
        else {
          spos.unshift(0);
          epos.unshift(0);
        }
        // now a different calculation for dot size
        for (j = pcarr.length-1; j >= 0; j--) {
          if (pcarr[i].pc == pcarr[j].pc && pcarr[i].fixed == pcarr[j].fixed) {
              c++;
          }
        }
        pcarr[i].dot.attr({r: Math.sqrt(c) * dsize});
      }
      (function step() {
        var i, nx, ny,
          adj = counter/asteps;
        for (i = pcarr.length-1; i >= 0; i--) {
          // set dot position if pc is not fixed
          if (!pcarr[i].fixed) {
            nx = spos[i].x + adj * (epos[i].x - spos[i].x);
            ny = spos[i].y + adj * (epos[i].y - spos[i].y);
            pcarr[i].dot.attr({cx: nx, cy: ny});
          }
        }
        if (counter < asteps) {
          window.setTimeout(function() {
            step();
          }, animint);
        } else {
          var sizes;
          // invert pcs
          for (i = pcarr.length-1; i >= 0; i--) {
            if (!pcarr[i].fixed) {
              if (transform == 'invert')
                nx = modularize(index-pcarr[i].pc);
              else
                nx = modularize(index+pcarr[i].pc);
              pcarr[i].pc = nx;
            }
          }
          sizes = getdotsizes();
          //separate for loop for dot sizes since pcs need to be inverted first
          for (i = pcarr.length-1; i >= 0; i--) {
            pcarr[i].dot.attr({r: sizes[i]});
          }
          if (callback && typeof callback === 'function') {
            callback();
          }
          active = false;
        }
        counter++;
      }());
    };

    exports.clear = function () {
      if (!paper) return;
      var paperDom = paper.canvas;
      paperDom.parentNode.removeChild(paperDom);
    };

    return exports;
  };

}(document, window));
