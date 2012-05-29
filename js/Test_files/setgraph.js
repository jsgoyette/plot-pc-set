var setGraph = function (id) {
  var self = this;
  self.m = 12;
  self.pcs = [];
  var paper;
  var r = 140; //radius
  var p = 20; //pad
  var containersize = 2*(r+p);
  var pcobj = [];
  
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
//    return pc;
  }

  self.configure = function (opts) {
    r = opts.radius || r;
    p = opts.padding || p;
  }

  self.drawset = function () {
    if (paper) {
      clear(paper);
      pcobj = [];
    }
    paper = new Raphael(document.getElementById(id), containersize, containersize);  
    var circle = paper.circle(r+p, r+p, r);
    circle.attr({'stroke-width':3});
    for (var i = 0; i < m; i++) {
      var pos = pcPos(i);
      var dot = paper.circle(pos.x, pos.y, 5);
      dot.attr({fill:"white"});
    }
    for (var i = self.pcs.length-1; i >= 0; i--) {
      var pos = pcPos(self.pcs[i]);
      if (0) {
        for (var j = i-1; j >= 0; j--) {
          var pos2 = pcPos(self.pcs[j]);
          var ln = "M " + pos.x + " " + pos.y + " L " + pos2.x + " " + pos2.y;
          var line = paper.path(ln);
          if (j==i-1 || (i==pcs.length-1 && j==0)) {
            line.attr({
              'stroke-width':3,
              'stroke':'#666'
            });
          } else {
            line.attr({
              'stroke-width':2,
              'stroke':'#ddd'
            });        
          }
        }
      }
      var dot = paper.circle(pos.x, pos.y, 6);
      dot.attr({fill:"black"});
//      dot.glow({'width':6});
			pcobj.unshift(dot); //adds to beginning of array
    }
  }

	self.transpose = function (tn, callback) {
    for (var i = pcobj.length-1; i >= 0; i--) {
      self.pcs[i] = modularize(self.pcs[i]+tn);
      var pos = pcPos(self.pcs[i]);
      pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
    }
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
        var pos = pcPos(self.pcs[i]);
        pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
      }
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
      var pos = pcPos(self.pcs[i]);
      pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
    }
    if (callback && typeof callback == 'function') {
      callback();
    }
  }

  self.animInvertDirect = function (index, callback) {
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= 0; i--) {
        self.pcs[i] = modularize(tmp_pcs[i]+(adj*(index-2*tmp_pcs[i])));
        var pos = pcPos(self.pcs[i]);
        pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
      }
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

  self.animInvert = function (index, callback) {
    var counter = 0;
    var intervals = 40;
    var tmp_pcs = self.pcs.slice(0);
    function step() {
      var adj = counter/intervals;
      for (var i = pcobj.length-1; i >= 0; i--) {
        self.pcs[i] = modularize(tmp_pcs[i]+(adj*(index-2*tmp_pcs[i])));
        var pos = pcPos(self.pcs[i]);
        pcobj[i].attr({cx: pos.x, cy: pos.y});  //set the circle position
      }
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

