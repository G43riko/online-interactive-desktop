function drawGrid(width = 0.1, dist = 50, strong = 0){
	var i = 0;
	context.beginPath();
	context.lineWidth = width;
	context.strokeStyle = "black";
	while((i += dist) < canvas.width){
		context.moveTo(i,0);
		context.lineTo(i,canvas.height);
	}
	i = 0;
	while((i += dist) < canvas.height){
		context.moveTo(0, i);
		context.lineTo(canvas.width, i);
	}
	context.stroke();
}

function doPolygon(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Polygon" + " bez pointov");

	var res = $.extend(_initDef(obj), obj);


	res.ctx.beginPath();

	var drawLines = function(points){
		var size = points.length;

		if(res.radius == 0 || isNaN(res.radius))
			points.forEach((e, i) => i > 0 ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
		else
			points.forEach(function(e, i){
				var v1, v2, l1, l2;
				if (i == 0) {
					v1 = points[i + 1].getClone().sub(e);
					v2 = e.getClone().sub(points[size - 1]);
					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(typeof res.radius == "number"){
						l1 >>= 1;
						l2 >>= 1;
					}
					else{
						res.radius.replace("px", "");
						l1 = l2 = 1;
					}
					res.ctx.moveTo(points[size - 1].x + v2.x * l2 * res.radius, points[size - 1].y + v2.y * l2 * res.radius);
					res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
				}
				else{
					v1 = points[(i + 1)%size].getClone().sub(e);
					v2 = e.getClone().sub(points[i - 1]);

					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(typeof res.radius == "number"){
						l1 >>= 1;
						l2 >>= 1;
					}
					else{
						res.radius.replace("px", "");
						l1 = l2 = 1;
					}
					res.ctx.lineTo(e.x - v2.x * l2 * res.radius, e.y - v2.y * l2 * res.radius);
					res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
				}
			});
		res.ctx.closePath();
	};
	if(Array.isArray(res.points[0]))
		res.points.forEach(a => drawLines(a));
	else
		drawLines(res.points);

	_process(res);
}

function doArc(obj){
	var res = _remakePosAndSize(_checkPosAndSize(obj, "Arc"), obj);

	res.ctx.beginPath();
	res.ctx.ellipse(res.x + (res.width >> 1), res.y + (res.height >> 1), res.width >> 1, res.height >> 1, 0, 0, PI2);

	_process(res);
}

function doRect(obj){
	var def = _checkPosAndSize(obj, "Rect");

	if(!isUndefined(obj["radius"])){
		if(typeof obj["radius"] === "number")
			obj["radius"] = {tl: obj["radius"], tr: obj["radius"], br: obj["radius"], bl: obj["radius"]};
		else
			$.each(def.radius, i => obj.radius[i] = obj.radius[i] || def.radius[i]);
	}

	var res = _remakePosAndSize(def, obj);

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

function doLine(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Line" + " bez pointov");

	if(obj.points.length < 2)
		Logger.error("chce sa vykresliť " + "Line" + " s 1 bodom");

	var res = $.extend(_initDef(obj), obj),
		v1, v2, l1, l2;

	res.ctx.beginPath();

	var drawLines = function(points){
		if(isNaN(points[0])){
			if(res.radius == 0 || isNaN(res.radius))
				points.forEach((e, i) => i > 0 ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
			else
				points.forEach(function(e, i){
					if(i == 0)
						res.ctx.moveTo(e.x, e.y);
					else if(i + 1 < points.length){
						v1 = points[i + 1].getClone().sub(e);
						v2 = e.getClone().sub(points[i - 1]);
						l1 = v1.getLength();
						l2 = v2.getLength();
						v2.div(l2);
						v1.div(l1);
						if(typeof res.radius == "number"){
							l1 >>= 1;
							l2 >>= 1;
						}
						else{
							res.radius.replace("px", "");
							l1 = l2 = 1;
						}
						res.ctx.lineTo(e.x - v2.x * l2 * res.radius, e.y - v2.y * l2 * res.radius);
						res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
					}
					else
						res.ctx.lineTo(e.x, e.y);
				});

		}
		else{
			res.ctx.moveTo(points[0], points[1]);
			res.ctx.lineTo(points[2], points[3]);
		}
	};

	if(Array.isArray(res.points[0]))
		res.points.forEach(a => drawLines(a));
	else
		drawLines(res.points);


	res["fill"] = false;
	_process(res)
}

function drawQuadraticCurve(points, borderWidth = DEFAULT_STROKE_WIDTH, borderColor = DEFAUL_STROKE_COLOR, ctx = context){
	if(points.length < 2)
		return;

	ctx.lineWidth = borderWidth;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	points.forEach((e, i) => i == 0 ? ctx.moveTo(e.x, e.y) : ctx.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y));
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

/*
 * UTILS
 */

function getMaxWidth(val, max = 0){
	if(Array.isArray(val))
		val.forEach(function(e){
			if(Array.isArray(e))
				e.forEach(a => max = Math.max(calcTextWidth(a), max));
			else
				max = Math.max(calcTextWidth(e), max);
		});
	else
		return calcTextWidth(val);
	return max;
}

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

function calcTextWidth(value, font = false){
	if(font)
		context.font = font;
	return context.measureText(value).width;
}

/*
 * PRIVATE
 */

function _initDef(obj){
	var def = {
		borderWidth : DEFAULT_STROKE_WIDTH,
		borderColor : DEFAUL_STROKE_COLOR,
		ctx : context,
		fillColor : DEFAULT_BACKGROUND_COLOR,
		radius : {tl: 0, tr: 0, br: 0, bl: 0},
		shadow: false,
		lineCap: LINE_CAP_BUTT,
		joinType: LINE_JOIN_MITER,
		lineStyle: LINE_STYLE_NORMAL,
		lineType: JOIN_LINEAR,
		lineDash: []
	};
	def["draw"] = !isUndefined(obj.borderColor) || !isUndefined(obj.borderWidth);
	def["fill"] = !isUndefined(obj.fillColor);

	return def;
}

function _checkPosAndSize(obj, name){

	if((isUndefined(obj["x"]) || isUndefined(obj["y"])) && isUndefined(obj["position"]))
		Logger.error("chce sa vykresliť " + name + " bez pozície");

	if((isUndefined(obj["width"]) || isUndefined(obj["height"])) && isUndefined(obj["size"]))
		Logger.error("chce sa vykresliť " + name + " bez velkosti");

	if(obj["width"] <= 0 || obj["height"] <= 0)
		Logger.error("chce sa vykresliť " + name + " zo zápornou velkosťou");

	return _initDef(obj);
}

function _remakePosAndSize(def, obj){
	var res = $.extend(def, obj);

	if(!isUndefined(res["size"])){
		if(typeof res["size"] === "number"){
			res["width"] = res["size"];
			res["height"] = res["size"];
		}
		else if(Array.isArray(res["size"])){
			res["width"] = res["size"][0];
			res["height"] = res["size"][1];
		}
		else{
			res["width"] = res["size"].x;
			res["height"] = res["size"].y;
		}
	}

	if(!isUndefined(res["position"])){
		if(typeof res["position"] === "number"){
			res["x"] = res["position"];
			res["y"] = res["position"];
		}
		else if(Array.isArray(res["position"])){
			res["x"] = res["position"][0];
			res["y"] = res["position"][1];
		}
		else{
			res["x"] = res["position"].x;
			res["y"] = res["position"].y;
		}
	}
	return res;
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

	res.ctx.lineCap = res.lineCap;
	res.ctx.lineJoin = res.joinType;
	res.ctx.setLineDash(res.lineDash);

	if (res.draw){
		res.ctx.lineWidth = res.borderWidth;
		res.ctx.strokeStyle = res.borderColor;
		res.ctx.stroke();
	}
}
