function resetCanvas(){
	context.clearRect(0, 0, canvas.width, canvas.height);
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

function drawGrid(width = 0.1, dist = 50, strong = 0){
	var i = 0;
	context.beginPath();
	context.lineWidth = width;
	context.strokeStyle = "black";
	while((i += dist) < canvas.width){
		if(strong > 0 && i % strong == 0){
			context.lineWidth = width << 1;
			context.moveTo(i, 0);
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

function doArc(obj){
	var def = _getDef();

	_checkPosAndSize(def, obj, "Arc");

	var res = $.extend(def, obj);

	_remakePosAndSize(res);

	res.ctx.beginPath();
	res.ctx.ellipse(res.x + (res.width >> 1), res.y + (res.height >> 1), res.width >> 1, res.height >> 1, 0, 0, PI2);

	_process(res);
}

function doRect(obj){
	var def = _getDef();

	_checkPosAndSize(def, obj, "Rect");

	if(!isUndefined(obj["radius"])){
		if(typeof obj["radius"] === "number")
			obj["radius"] = {tl: obj["radius"], tr: obj["radius"], br: obj["radius"], bl: obj["radius"]};
		else
			$.each(def.radius, i => obj.radius[i] = obj.radius[i] || def.radius[i]);
	}

	var res = $.extend(def, obj);

	_remakePosAndSize(res);

	res.ctx.beginPath();
	res.ctx.moveTo(res.x + res.radius.tl, res.y);
	res.ctx.lineTo(res.x + res.width - res.radius.tr, res.y);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y, res.x + res.width, res.y + res.radius.tr);
	res.ctx.lineTo(res.x + res.width, res.y + res.height - res.radius.br);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y + res.height, res.x + res.width - res.radius.br, res.y + res.height);
	res.ctx.lineTo(res.x + res.radius.bl, res.y + res.height);
	res.ctx.quadraticCurveTo(res.x, res.y + res.height, res.x, res.y + res.height - res.radius.bl);
	res.ctx.lineTo(res.x, res.y + res.radius.tl);
	res.ctx.quadraticCurveTo(res.x, res.y, res.x + res.radius.tl, res.y);
	res.ctx.closePath();

	_process(res);
}

function _getDef(){
	return {
		borderWidth : DEFAULT_STROKE_WIDTH,
		borderColor : DEFAUL_STROKE_COLOR,
		ctx : context,
		fillColor : DEFAULT_BACKGROUND_COLOR,
		radius : {tl: 0, tr: 0, br: 0, bl: 0},
		shadow: false
	}
}

function _checkPosAndSize(def, obj, name){
	def["draw"] = !isUndefined(obj.borderColor) || !isUndefined(obj.borderWidth);
	def["fill"] = !isUndefined(obj.fillColor);


	if((isUndefined(obj["x"]) || isUndefined(obj["y"])) && isUndefined(obj["position"]))
		Logger.error("chce sa vykresliť " + name + " bez pozície");

	if((isUndefined(obj["width"]) || isUndefined(obj["height"])) && isUndefined(obj["size"]))
		Logger.error("chce sa vykresliť " + name + " bez velkosti");

	if(obj["width"] <= 0 || obj["height"] <= 0)
		Logger.error("chce sa vykresliť " + name + " zo zápornou velkosťou");
}

function _remakePosAndSize(res){
	if(!isUndefined(res["size"])){
		res["width"] = res["size"].x;
		res["height"] = res["size"].y;
	}

	if(!isUndefined(res["position"])){
		res["x"] = res["position"].x;
		res["y"] = res["position"].y;
	}
}

function _process(res){
	if(res.shadow)
		setShadow(res.shadow);

	if (res.fill){
		res.ctx.fillStyle = res.fillColor;
		res.ctx.fill();
	}

	if(res.shadow)
		setShadow(false);


	if (res.draw){
		res.ctx.lineWidth = res.borderWidth;
		res.ctx.strokeStyle = res.borderColor;
		res.ctx.stroke();
	}
}

function drawArc(x, y, width, height, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	ctx.ellipse(x + (width >> 1), y + (height >> 1), Math.abs(width >> 1), Math.abs(height >> 1), 0, 0, PI2);
	//context.ellipse(round(x + (width >> 1)), round(y + (height >> 1)), round(Math.abs(width >> 1)), round(Math.abs(height >> 1)), 0, 0, PI2);
	ctx.stroke();
}

function fillArc(x, y, width, height, color, ctx = context){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(x + (width >> 1), y + (height >> 1), Math.abs(width >> 1), Math.abs(height >> 1), 0, 0, PI2);
	//context.ellipse(round(x + (width >> 1)), round(y + (height >> 1)), round(Math.abs(width >> 1)), round(Math.abs(height >> 1)), 0, 0, PI2);
	ctx.fill();
}

function fillPolygon(points, color, ctx = context){
	ctx.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			ctx.moveTo(e.x, e.y);
		else
			ctx.lineTo(e.x, e.y);

	});

	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}

function drawPolygon(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	ctx.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			context.moveTo(e.x, e.y);
		else
			context.lineTo(e.x, e.y);

	});

	ctx.closePath();
	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.stroke();
}


function drawLine(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, type = JOIN_LINEAR, ctx = context){
	if(points.length < 2)
		return;
	var i;
	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	if(isNaN(points[0])){
		if(type == JOIN_LINEAR || points.length < 3){
			points.forEach(function(e, i){
				if(i == 0)
					ctx.moveTo(e.x, e.y);
				else
					ctx.lineTo(e.x, e.y);
			});
		}
		else{
			ctx.moveTo(points[0].x, points[0].y);
			for(i=1 ; i<points.length-1 ; i++){
				context.quadraticCurveTo(points[i].x + (points[i].x - points[i + 1].x) / 2,
										 points[i].y + (points[i].y - points[i + 1].y) / 2, points[i].x, points[i].y);
			}
			i = points.length - 2;
			ctx.quadraticCurveTo(points[i].x + (points[i].x - points[i - 1].x) / 2,
									 points[i].y + (points[i].y - points[i - 1].y) / 2, points[i+1].x, points[i+1].y);
		}
	}
	else{
		ctx.moveTo(points[0], points[1]);
		ctx.lineTo(points[2], points[3]);
	}
	ctx.stroke();
}

function drawQuadraticCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	if(points.length < 2)
		return;

	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			ctx.moveTo(e.x, e.y);
		else
			ctx.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y);
	});
	ctx.stroke();
}

function drawBazierCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	if(points.length < 2)
		return;

	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	points.forEach(function(e, i){
		if(i == 0)
			ctx.moveTo(e.x, e.y);
		else
			ctx.bezierCurveTo(e[0].x, e[0].y, e[1].x, e[1].y, e[2].x, e[2].y);
	});
	ctx.stroke();
}

function fillText(text, x, y, size = DEFAULT_FONT_SIZE, color = DEFAULT_FONT_COLOR, offset = 0, align = FONT_ALIGN_NORMAL, ctx = context){
	ctx.font = size + "pt " + DEFAULT_FONT;
	ctx.fillStyle = color;

	if(align == FONT_ALIGN_NORMAL){
		ctx.textAlign = FONT_HALIGN_LEFT;
		ctx.textBaseline = FONT_VALIGN_TOP;
		if(Array.isArray(offset))
			ctx.fillText(text, x + offset[0], y + offset[1]);
		else
			ctx.fillText(text, x + offset, y + offset);
	}
	else if(align == FONT_ALIGN_CENTER){
		ctx.textAlign = FONT_HALIGN_CENTER;
		ctx.textBaseline = FONT_VALIGN_MIDDLE;
		ctx.fillText(text, x, y);
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
