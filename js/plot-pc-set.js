(function ( window ) {
  "use strict";

  function roundNumber(n, dec) {
    var result = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  var sg = window.setGraph = function (id) {

    var exports = {},
      paper,  // Raphael object
      active = false,
      pcarr = [], // array of pcobj
      m = 12, // modulus
      r = 180, // radius of big circle
      p = 30, // padding between circle and edge of canvas
      csize = 2 * (r + p), // container size
      tsize = 5, // tick size
      dsize = 8, // dot size
      dotclick = function () {
        return false;
      };

    // convert pc to range between 0 and mod
    function modularize(pc) {
      while (pc >= m) { pc -= m; }
      while (pc < 0) { pc += m; }
      return roundNumber(pc, 2);
    }

    function pcPos(pc) {
      var cos = Math.cos(pc / m * 2 * Math.PI);
      var sin = Math.sin(pc / m * 2 * Math.PI);
      return {
        'x': r * sin + r + p,
        'y': -1 * r * cos + r + p
      };
    }

    //determine dot size for multisets
    function getdotsize(pc) {
      var i, c = 0;
      for (i = pcarr.length-1; i >= 0; i--) {
        if (pcarr[i].pc == pc) {
          c++;
        }
      }
      return Math.sqrt(c) * dsize;
    }

    function positiondots() {
      for (var i = pcarr.length-1; i >= 0; i--) {
        if (!pcarr[i].fixed) {
          //set the circle position
          var pos = pcPos(pcarr[i].pc);
          pcarr[i].dot.attr({cx: pos.x, cy: pos.y});
        }
        // adjust dot size
        pcarr[i].dot.attr({r: getdotsize(pcarr[i].pc)});
      }
    }

    var pcobj = function (p, f) {
      this.pc = p || 0;
      this.fixed = f || false;
      var pos = pcPos(p);
      this.dot = paper.circle(pos.x, pos.y, getdotsize(p));
      this.dot.attr({fill: "black"});
      this.dot.click(dotclick);
    }

    exports.configure = function (opts) {
      m = opts.mod || m;
      r = opts.radius || r;
      p = opts.padding || p;
      csize = 2 * (r + p);
      tsize = opts.ticksize || tsize;
      dsize = opts.dotsize || dsize;
      dotclick = opts.dotclick && typeof opts.dotclick === 'function' ? opts.dotclick : dotclick;
    }

    exports.plotpcs = function (pcs, fix) {
      if (paper) {
        exports.clear(paper);
        pcarr = [];
      }
      paper = new Raphael(document.getElementById(id), csize, csize);
      // make big circle
      var circle = paper.circle(r + p, r + p, r);
      circle.attr({'stroke-width': 4});
      // make ticks
      for (var i = 0; i < m; i++) {
        var pos = pcPos(i);
        var dot = paper.circle(pos.x, pos.y, tsize);
        dot.attr({fill: "white"});
      }
      // make array of pcobj
      pcs = pcs || [];
      for (var i = pcs.length-1; i >= 0; i--) {
        fix = fix || 0;
        var f = (i >= fix) ? false : true;
        var obj = new pcobj(pcs[i], f);
        pcarr.unshift(obj);
      }
      positiondots();
    }

    exports.getpcs = function () {
      var pcs = [];
      for (var i = pcarr.length-1; i >= 0; i--) {
        pcs.unshift(pcarr[i].pc)
      }
      return pcs;
    }

    exports.transpose = function (tn, callback) {
      for (var i = pcarr.length-1; i >= 0; i--) {
        if (!pcarr[i].fixed)
          pcarr[i].pc = modularize(pcarr[i].pc + tn);
      }
      positiondots();
      if (callback && typeof callback === 'function') {
        callback();
      }
    }

    exports.animTranspose = function (tn, callback) {
      if (active) return;
      active = true;
      var counter = 0,
        intervals = 40,
        tmp_pcs = exports.getpcs();
      function step() {
        var adj = (tn * counter / intervals);
        for (var i = pcarr.length-1; i >= 0; i--) {
          if (!pcarr[i].fixed)
            pcarr[i].pc = modularize(tmp_pcs[i] + adj);
        }
        positiondots();
        if (callback && typeof callback === 'function') {
          callback();
        }
        if (counter < intervals) {
          setTimeout(function() {
            step();
          }, 10);
        } else {
          active = false;
        }
        counter++;
      }
      step();
    }

    exports.invert = function (index, callback) {
      for (var i = pcarr.length-1; i >= 0; i--) {
        if (!pcarr[i].fixed)
          pcarr[i].pc = modularize(index - pcarr[i].pc);
      }
      positiondots();
      if (callback && typeof callback === 'function') {
        callback();
      }
    }

    exports.animInvert = function (index, callback) {
      if (active) return;
      active = true;
      var counter = 0,
        intervals = 40,
        tmp_pcs = exports.getpcs();
      function step() {
        var adj = counter/intervals;
        for (var i = pcarr.length-1; i >= 0; i--) {
          if (!pcarr[i].fixed) {
            // ordered interval from start to end
            var stoe = modularize(index - 2 * tmp_pcs[i]);
            // go the shortest route
            if (stoe > m / 2) stoe -= m;
            pcarr[i].pc = modularize(tmp_pcs[i] + (adj * stoe));
            var pos = pcPos(pcarr[i].pc);
            //set the circle position
            pcarr[i].dot.attr({cx: pos.x, cy: pos.y});
          }
          pcarr[i].dot.attr({r: getdotsize(pcarr[i].pc)});
        }
        if (callback && typeof callback === 'function') {
          callback();
        }
        if (counter < intervals) {
          setTimeout(function() {
            step();
          }, 10);
        } else {
          active = false;
        }
        counter++;
      }
      step();
    }

    exports.animInvertDirect = function (index, callback) {
      if (active) return;
      active = true;
      var counter = 0,
        intervals = 40,
        spos = [],
        epos = [];
      for (var i = pcarr.length-1; i >= 0; i--) {
        var c = 0;
        if (!pcarr[i].fixed) {
          spos.unshift(pcPos(pcarr[i].pc));
          epos.unshift(pcPos(modularize(index-pcarr[i].pc)));
        }
        else {
          spos.unshift(0);
          epos.unshift(0);
        }
        // now a different calculation for dot size
        for (var j = pcarr.length-1; j >= 0; j--) {
          if (pcarr[i].pc == pcarr[j].pc && pcarr[i].fixed == pcarr[j].fixed) {
              c++;
          }
        }
        pcarr[i].dot.attr({r: Math.sqrt(c) * dsize});
      }
      function step() {
        var adj = counter/intervals;
        for (var i = pcarr.length-1; i >= 0; i--) {
          // set dot position if pc is not fixed
          if (!pcarr[i].fixed) {
            var nx = spos[i].x + adj * (epos[i].x - spos[i].x),
               ny = spos[i].y + adj * (epos[i].y - spos[i].y);
            pcarr[i].dot.attr({cx: nx, cy: ny});
          }
        }
        if (counter < intervals) {
          setTimeout(function() {
            step();
          }, 10);
        } else {
          // invert pcs
          for (var i = pcarr.length-1; i >= 0; i--) {
            if (!pcarr[i].fixed) pcarr[i].pc = modularize(index-pcarr[i].pc);
          }
          //separate for loop for dot sizes since pcs need to be inverted first
          for (var i = pcarr.length-1; i >= 0; i--) {
            pcarr[i].dot.attr({r: getdotsize(pcarr[i].pc)});
          }
          if (callback && typeof callback === 'function') {
            callback();
          }
          active = false;
        }
        counter++;
      }
      step();
    }

    exports.clear = function () {
      if (!paper) return;
      var paperDom = paper.canvas;
      paperDom.parentNode.removeChild(paperDom);
    }

    return exports;
  }

}(window));
