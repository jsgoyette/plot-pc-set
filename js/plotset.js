function drawset(id, pcset, opts) {
  var m = pcset.mod || 12;
  var pcs = pcset.pcs || [];
  var r = opts.radius || 140;
  var p = opts.pad || 20;
  var containersize = 2*(r+p);
  var paper = new Raphael(document.getElementById(id), containersize, containersize);  
  var circle = paper.circle(r+p, r+p, r);

  circle.attr({'stroke-width':3});
  for (var i = 0; i < m; i++) {
    var cos = Math.cos(i/m*2*Math.PI);
    var sin = Math.sin(i/m*2*Math.PI);
    var dot = paper.circle(r*sin+r+p, -1*r*cos+r+p, 4);
    dot.attr({fill:"white"});
  }
  for (var i = pcs.length-1; i >= 0; i--) {
    var cos = Math.cos(pcs[i]/m*2*Math.PI);
    var sin = Math.sin(pcs[i]/m*2*Math.PI);
    var x = r*sin+r+p;
    var y = -1*r*cos+r+p
    if (i) {
      for (var j = i-1; j >= 0; j--) {
        var x2 = r*Math.sin(pcs[j]/m*2*Math.PI)+r+p;
        var y2 = -1*r*Math.cos(pcs[j]/m*2*Math.PI)+r+p;
        var ln = "M " + x + " " + y + " L " + x2 + " " + y2;
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
    var dot = paper.circle(x, y, 4);
    dot.attr({fill:"black"});
    dot.glow({'width':6});
  }
}
