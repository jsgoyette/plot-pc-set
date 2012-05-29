var setGraph = function (id) {
  var self = this;
  self.m = 12;
  self.pcs = [];
  var paper;
  var r = 150; //radius
  var p = 20; //pad
  var containersize = 2*(r+p);
  var pcobj = [];
  var lnobj = [];
  
  function pcPos(pc) {
    var cos = Math.cos(pc/m*2*Math.PI);
    var sin = Math.sin(pc/m*2*Math.PI);
    return {
      'x': r*sin+r+p,
      'y': -1*r*cos+r+p
    };
  }

  function modularize(pc) {
    while (pc >= m) pc -= m;
    while (pc < 0) pc += m;
    return roundNumber(pc, 2);
  }

  function positiondots() {
    for (var i = self.pcs.length-1; i >= 0; i--) {
      var pos = pcPos(self.pcs[i]);
      pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
    }
  }
  
  self.configure = function (opts) {
    r = opts.radius || r;
    p = opts.padding || p;
    containersize = 2*(r+p);
  }

  self.drawset = function () {
    if (paper) {
      clear(paper);
      pcobj = [];
    }
    paper = new Raphael(document.getElementById(id), containersize, containersize);  
    var circle = paper.circle(r+p, r+p, r);
    circle.attr({'stroke-width':4});
    for (var i = 0; i < m; i++) {
      var pos = pcPos(i);
      var dot = paper.circle(pos.x, pos.y, 5);
      dot.attr({fill:"white"});
    }
    for (var i = self.pcs.length-1; i >= 0; i--) {
      var pos = pcPos(self.pcs[i]);
      var dot = paper.circle(pos.x, pos.y, 7);
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
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = (tn*counter/intervals);
      for (var i = pcobj.length-1; i >= 0; i--) {
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
      }
      counter++;
    }
    step();
  }

  self.invert = function (index, callback) {
    for (var i = pcobj.length-1; i >= 0; i--) {
      self.pcs[i] = modularize(index-self.pcs[i]);
    }
    positiondots();
    if (callback && typeof callback == 'function') {
      callback();
    }
  }

  self.animInvert = function (index, callback) {
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= 0; i--) {
        var stoe = modularize(index-2*tmp_pcs[i]); // ordered interval from starting point to ending point
        if (stoe > m/2) stoe -= m; // go the shortest route
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
      }
      counter++;
    }
    step();
  }

  self.animInvertDirect = function (index, callback) {
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    var spos = []; // arrays of start and end positions
    var epos = [];
    for (var i = pcs.length-1; i >= 0; i--) {
      pcs[i] = modularize(index-pcs[i]);
      spos.unshift(pcPos(tmp_pcs[i]));
      epos.unshift(pcPos(self.pcs[i]));
    }
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= 0; i--) {        
        var nx = spos[i].x + adj*(epos[i].x - spos[i].x);
        var ny = spos[i].y + adj*(epos[i].y - spos[i].y);
        pcobj[i].attr({cx: nx, cy: ny});  //set the circle position
      }
      if (counter < intervals) {
        setTimeout(function() { 
          step();
        }, 10);
      } else {
        if (callback && typeof callback == 'function') {
          callback();
        }      
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

