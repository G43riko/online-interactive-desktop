function resetCanvas(){
	context.fillStyle = DEFAULT_BACKGROUND_COLOR;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function initCanvasSize(){
	var tmpC = $(canvas);
	canvas.width = tmpC.width();
	canvas.height = tmpC.height();
}

function setShadow(variable){
	context.shadowBlur = variable ? DEFAULT_SHADOW_BLUR : 0;
	context.shadowOffsetX = variable ? DEFAULT_SHADOW_OFFSET : 0;
	context.shadowOffsetY = variable ? DEFAULT_SHADOW_OFFSET : 0;
}

function setLineDash(variable){
	if(variable)
		context.setLineDash([15, 5]);
}

function canvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	image.width = canvas.width;
	image.height = canvas.height;
	return image;
}

function imageToCanvas(image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);

	return canvas;
}

function roundRect(x, y, width, height, radius = 5, fill = true, stroke = true) {
	var defaultRadius;
	if (typeof radius === 'number')
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	else {
		defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		$.each(defaultRadius, function(i){
			radius[i] = radius[i] || defaultRadius[i];
		});
		/*
		defaultRadius.forEach(function(e, i){
			radius[i] = e || defaultRadius[i];
		});
		*/
	}

	this.beginPath();
	this.moveTo(x + radius.tl, y);
	this.lineTo(x + width - radius.tr, y);
	this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	this.lineTo(x + width, y + height - radius.br);
	this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	this.lineTo(x + radius.bl, y + height);
	this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	this.lineTo(x, y + radius.tl);
	this.quadraticCurveTo(x, y, x + radius.tl, y);
	this.closePath();
	if (fill)
		this.fill();
	if (stroke)
		this.stroke();
}

function drawGrid(width = 0.1, dist = 50, strong = 0){
	var i = 0;
	context.beginPath();
	context.lineWidth = width;
	while((i += dist) < canvas.width){
		if(strong > 0 && i % strong == 0){
			context.lineWidth = width << 1;
			context.moveTo(i,0);
			context.lineTo(i,canvas.height);
			context.lineWidth = width;
		}
		context.moveTo(i,0);
		context.lineTo(i,canvas.height);
	}
	i = 0;
	while((i += dist) < canvas.height){
		context.save();
		if(strong > 0 && i % strong == 0)
			context.lineWidth = width << 1;

		context.moveTo(0, i);
		context.lineTo(canvas.width, i);
		context.restore();
	}
	context.stroke();
}

function drawRect(x, y, width, height, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR){
	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.strokeRect(x, y, width, height);
}

function fillRect(x, y, width, height, color){
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function drawArc(x, y, width, height, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR){
	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.beginPath();
	context.ellipse(x + (width >> 1), y + (height >> 1), Math.abs(width >> 1), Math.abs(height >> 1), 0, 0, PI2);
	context.stroke();
}

function fillArc(x, y, width, height, color){
	context.fillStyle = color;
	context.beginPath();
	context.ellipse(x + (width >> 1), y + (height >> 1), Math.abs(width >> 1), Math.abs(height >> 1), 0, 0, PI2);
	context.fill();
}

function fillPolygon(points, color){
	context.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			context.moveTo(e.x, e.y);
		else
			context.lineTo(e.x, e.y);

	});

	context.fillStyle = color;
	context.fill();
	context.closePath();
}
function drawPolygon(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR){
	context.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			context.moveTo(e.x, e.y);
		else
			context.lineTo(e.x, e.y);

	});

	context.closePath();
	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.stroke();
}


function drawLine(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, type = JOIN_LINEAR){
	if(points.length < 2)
		return;

	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.beginPath();
	if(isNaN(points[0])){
		if(type == JOIN_LINEAR || points.length < 3){
			points.forEach(function(e, i){
				if(i == 0)
					context.moveTo(e.x, e.y);
				else
					context.lineTo(e.x, e.y);
			});
		}
		else{
			context.moveTo(points[0].x, points[0].y);
			for(var i=1 ; i<points.length-1 ; i++){
				context.quadraticCurveTo(points[i].x + (points[i].x - points[i + 1].x) / 2,
										 points[i].y + (points[i].y - points[i + 1].y) / 2, points[i].x, points[i].y);
			}
			var i = points.length - 2;
			context.quadraticCurveTo(points[i].x + (points[i].x - points[i - 1].x) / 2,
									 points[i].y + (points[i].y - points[i - 1].y) / 2, points[i+1].x, points[i+1].y);
			/*
			for(var i=1 ; i<points.length-1 ; i+=2)
				context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
			if(points.length % 2 == 0)
				context.quadraticCurveTo((points[points.length - 1].x + points[points.length - 2].x) >> 1,
										 (points[points.length - 1].y + points[points.length - 2].y) >> 1,
										  points[points.length - 1].x,
										  points[points.length - 1].y);
			*/
		}
	}
	else{
		context.moveTo(points[0], points[1]);
		context.lineTo(points[2], points[3]);
	}
	context.stroke();
}

function drawQuadraticCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR){
	if(points.length < 2)
		return;

	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			context.moveTo(e.x, e.y);
		else
			context.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y);
	});
	context.stroke();
}

function drawBazierCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR){
	if(points.length < 2)
		return;

	context.lineWidth = borderWidth;
	context.strokeStyle = borderColor;
	context.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			context.moveTo(e.x, e.y);
		else
			context.bezierCurveTo(e[0].x, e[0].y, e[1].x, e[1].y, e[2].x, e[2].y);
	});
	context.stroke();
}

function fillText(text, x, y, size = DEFAULT_FONT_SIZE, color = DEFAULT_FONT_COLOR, offset = 0, align = FONT_ALIGN_NORMAL){
	context.font = size + "pt " + DEFAULT_FONT;
	context.fillStyle = color;

	if(align == FONT_ALIGN_NORMAL){
		context.textAlign = FONT_HALIGN_LEFT;
		context.textBaseline = FONT_VALIGN_TOP;
		if(Array.isArray(offset))
			context.fillText(text, x + offset[0], y + offset[1]);
		else
		context.fillText(text, x + offset, y + offset);
	}
	else if(align == FONT_ALIGN_CENTER){
		context.textAlign = FONT_HALIGN_CENTER;
		context.textBaseline = FONT_VALIGN_MIDDLE;
		context.fillText(text, x, y);
	}

}

function calcTextWidth(value, font = false){
	if(font)
		context.font = font;
	return context.measureText(value).width;
}


function getMaxWidth(val){
	var max = 0;
	if(Array.isArray(val)){
		val.forEach(function(e){
			if(Array.isArray(e)){
				e.forEach(function(ee){
					max = Math.max(calcTextWidth(ee), max);
				});
			}
			else
				max = Math.max(calcTextWidth(e), max);
		})
	}
	else
		return calcTextWidth(val);
	return max;
}
