var setGraph = function (id) {

  var self = this;
  self.m = 12;
  self.pcs = [];
  self.fix = 0; // number of fixed pcs
  var paper; // Raphael object
  var r = 180; // radius
  var p = 30; // pad
  var csize = 2*(r+p); // container size
  var ds = 7; // dot size
  var ts = 5; // tick size
  var ds_inc = 0.5 // ratio of increase in dot size for each added dot (1 is double)
  var active = false;
  var pcobj = [];
  
  function pcPos(pc) {
    var cos = Math.cos(pc/self.m*2*Math.PI);
    var sin = Math.sin(pc/self.m*2*Math.PI);
    return {
      'x': r*sin+r+p,
      'y': -1*r*cos+r+p
    };
  }

  function modularize(pc) {
    while (pc >= self.m) pc -= self.m;
    while (pc < 0) pc += self.m;
    return roundNumber(pc, 2);
  }
  
  function getdotsize (i) {
    var c = 0;
    for (var j = self.pcs.length-1; j >= 0; j--) {
      if (i != j && self.pcs[i] == self.pcs[j]) 
        c++;
    }
    return (1 + c*ds_inc) * ds;
  }
  
  function positiondots() {
    for (var i = self.pcs.length-1; i >= 0; i--) {
      if (i >= self.fix) {
        var pos = pcPos(self.pcs[i]);
        pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
      }
      pcobj[i].attr({r: getdotsize(i)}); // adjust dot size
    }
  }
    
  self.configure = function (opts) {
    r = opts.radius || r;
    p = opts.padding || p;
    ts = opts.ticksize || ts;
    ds = opts.dotsize || ds;
    ds_inc = opts.dotsizeinc || ds_inc;
    csize = 2*(r+p);
  }

  self.plotpcs = function () {
    if (paper) {
      clear(paper);
      pcobj = [];
    }
    paper = new Raphael(document.getElementById(id), csize, csize);  
    var circle = paper.circle(r+p, r+p, r);
    circle.attr({'stroke-width':4});
    for (var i = 0; i < self.m; i++) {
      var pos = pcPos(i);
      var dot = paper.circle(pos.x, pos.y, ts);
      dot.attr({fill:"white"});
    }
    for (var i = self.pcs.length-1; i >= 0; i--) {
      var pos = pcPos(self.pcs[i]);
      var dot = paper.circle(pos.x, pos.y, getdotsize(i));
      dot.attr({fill:"black"});
//      dot.glow({'width':6});
      pcobj.unshift(dot); //adds to beginning of array
    }
  }

  self.transpose = function (tn, callback) { 
    for (var i = pcobj.length-1; i >= 0; i--) {
      self.pcs[i] = modularize(self.pcs[i]+tn);
    }
    positiondots();
    if (callback && typeof callback == 'function') {
      callback();
    }
  }

  self.animTranspose = function (tn, callback) {
    if (active) return;
    active = true;
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = (tn*counter/intervals);
      for (var i = pcobj.length-1; i >= self.fix; i--) {
        self.pcs[i] = modularize(tmp_pcs[i]+adj);
      }
      positiondots();
      if (callback && typeof callback == 'function') {
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

  self.invert = function (index, callback) {
    for (var i = pcobj.length-1; i >= self.fix; i--) {
      self.pcs[i] = modularize(index-self.pcs[i]);
    }
    positiondots();
    if (callback && typeof callback == 'function') {
      callback();
    }
  }

  self.animInvert = function (index, callback) {
    if (active) return;
    active = true;
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= self.fix; i--) {
        var stoe = modularize(index-2*tmp_pcs[i]); // ordered interval from start to end
        if (stoe > self.m/2) stoe -= self.m; // go the shortest route
        self.pcs[i] = modularize(tmp_pcs[i]+(adj*stoe));
        var pos = pcPos(self.pcs[i]);
        pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
      }
      positiondots();
      if (callback && typeof callback == 'function') {
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

  self.animInvertDirect = function (index, callback) {
    if (active) return;
    active = true;
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    var spos = []; // arrays of start and end positions
    var epos = [];
    for (var i = self.pcs.length-1; i >= 0; i--) {
      if (i >= self.fix) {
        spos.unshift(pcPos(self.pcs[i]));
        epos.unshift(pcPos(modularize(index-self.pcs[i])));
        // make moving dots random for determining dot size
        // pcs that are unaffected by the inversion remain the same size
        if (self.pcs[i] != index - self.pcs[i]) self.pcs[i] = Math.random()*1001; 
      }
      else {
        spos.unshift(0);
        epos.unshift(0);
      }
      pcobj[i].attr({r: getdotsize(i)});
    }
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= 0; i--) {
        if (i >= self.fix) {     
          var nx = spos[i].x + adj*(epos[i].x - spos[i].x);
          var ny = spos[i].y + adj*(epos[i].y - spos[i].y);
          pcobj[i].attr({cx: nx, cy: ny});  //set the dot position
        }
        pcobj[i].attr({r: getdotsize(i)});
      }
      if (counter < intervals) {
        setTimeout(function() { 
          step();
        }, 10);
      } else {
        // reset random pcs and dot sizes
        for (var i = self.pcs.length-1; i >= 0; i--) {
          if (i >= self.fix) self.pcs[i] = modularize(index-tmp_pcs[i]);
          pcobj[i].attr({r: getdotsize(i)});
        }
        if (callback && typeof callback == 'function') {
          callback();
        }
        active = false;  
      }
      counter++;
    }
    step();
  }

  self.clear = function () {
    if (!paper) return;
    var paperDom = paper.canvas;
    paperDom.parentNode.removeChild(paperDom);
  }

  return self;
}

function roundNumber(num, dec) {
  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  return result;
}

