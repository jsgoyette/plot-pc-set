var paper;
var radius = 140;
var pad = 20;
var containersize = 2 * (radius + pad);

function drawset(mod, pcs, destroy) {  
	if (paper && destroy) clearPaper(paper);
	paper = new Raphael(document.getElementById('canvas_container'), containersize, containersize);  
	var circle = paper.circle(radius+pad, radius+pad, radius);
	circle.attr({'stroke-width':3});
	for (var i = 0; i < mod; i++)
	{
		var cos = Math.cos(i/mod*2*Math.PI);
		var sin = Math.sin(i/mod*2*Math.PI);
		var dot = paper.circle(radius*sin+radius+pad, -1*radius*cos+radius+pad, 4);
		dot.attr({fill:"white"});
	}
	for (var i = pcs.length-1; i >= 0; i--)
	{
		var cos = Math.cos(pcs[i]/mod*2*Math.PI);
		var sin = Math.sin(pcs[i]/mod*2*Math.PI);
		var x = radius*sin+radius+pad;
		var y = -1*radius*cos+radius+pad
		if (i)
		{
			for (var j = i-1; j >= 0; j--)
			{
				var x2 = radius*Math.sin(pcs[j]/mod*2*Math.PI)+radius+pad;
				var y2 = -1*radius*Math.cos(pcs[j]/mod*2*Math.PI)+radius+pad;
				var ln = "M " + x + " " + y + " L " + x2 + " " + y2;
				var line = paper.path(ln);
				if (j==i-1 || (i==pcs.length-1 && j==0))
				{
					line.attr({
						'stroke-width':3,
						'stroke':'#666'
					});
				}
				else
				{
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

function clearPaper(paper){
    var paperDom = paper.canvas;
    paperDom.parentNode.removeChild(paperDom);
}
