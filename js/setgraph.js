function setGraph(id) {
  var paper;
  var m = 12;
  var pcs = [];
  var r = 140;
  var p = 20;
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

  function configure (opts) {
    m = opts.m || m;
    pcs = opts.pcs || pcs;
    r = opts.radius || r;
    p = opts.pad || p;
  }

  function drawset() {
    if (paper) {
      clearPaper(paper);
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
    for (var i = pcs.length-1; i >= 0; i--) {
      var pos = pcPos(pcs[i]);
      if (i) {
        for (var j = i-1; j >= 0; j--) {
          var pos2 = pcPos(pcs[j]);
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
      var dot = paper.circle(pos.x, pos.y, 4);
      dot.attr({fill:"black"});
      dot.glow({'width':6});
    }
  }

  function clearPaper() {
    var paperDom = paper.canvas;
    paperDom.parentNode.removeChild(paperDom);
	}

	return {
	  'configure': configure,
	  'drawset': drawset,
	  'clear': clearPaper
	}
}
