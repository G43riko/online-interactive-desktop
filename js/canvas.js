/*
	compatible:	forEach, canvas, canvasText 14.9.2016
*/


class CanvasManager{
	constructor(arg1, arg2){
		if(arg1 instanceof HTMLImageElement){//ARGUMENT JE OBRAZOK
			this._canvas = CanvasManager.imageToCanvas(arg1);
		}
		else{
			this._canvas = document.createElement("canvas");

			if(arg1 && arg2){//ARGUMENTY SU VELKOST
				this.setCanvasSize(arg1, arg2);
			}
		}
		this._context = this._canvas.getContext("2d");
	}

	
	get canvas(){return this._canvas;}
	get context(){return this._context;}

	setShadow(x, y, color, blur){
		CanvasManager.setShadow(this._context, x, y, color, blur);
	}

	show(format = "image/png"){
		window.open(this._canvas.toDataURL(format), '_blank');
	}

	clearCanvas(){
		CanvasManager.clearCanvas(this._context);
	}

	setCanvasSize(width = window.innerWidth, height = window.innerHeight){
		CanvasManager.setCanvasSize(this._canvas, width, height);
	}

	appendTo(element){
		element.appendChild(this._canvas);
	}

	static clearCanvas(ctx){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	static setCanvasSize(c, width = window.innerWidth, height = window.innerHeight){
		c.width = width;
		c.height = height;
	}

	static setShadow(ctx, x, y, color, blur){
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = x;
      ctx.shadowOffsetY = y;
	}

	static imageToCanvas(image){
		var canvas = document.createElement("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);
		return canvas;
	}

	static setLineDash(ctx, ...args){
		//TODO otestovať;
		ctx.setLineDash(args);
	}

	static calcTextWidth(ctx, value, font = false){
		if(font)
			ctx.font = font;
		return ctx.measureText(value).width;
	}

	static canvasToImage(canvas, format = "image/png"){
		var image = new Image();
		image.src = canvas.toDataURL(format);
		image.width = canvas.width;
		image.height = canvas.height;
		return image;
	}
}

function drawGrid(width = GRID_WIDTH, dist = GRID_DIST, nthBold = GRID_NTH_BOLD, c = GRID_COLOR){
	var pointsNormal = [],
		pointsBold = [],
		boldCounter = 0,
		i;

	//vertikálne čiary
	for(i=0 ; i<canvas.width ; i+=dist){
		if(boldCounter++ % nthBold)
			pointsNormal.push([i, 0, i, canvas.height]);
		else
			pointsBold.push([i, 0, i, canvas.height]);
	}

	//horizontálne čiaty
	for(i=0 ; i<canvas.height ; i+=dist){
		if(boldCounter++ % nthBold)
			pointsNormal.push([0, i, canvas.width, i]);
		else
			pointsBold.push([0, i, canvas.width, i]);
	}

	//vykreslenie normálnych čiar
	doLine({
		points: pointsNormal,
		borderWidth: width,
		borderColor: c
	});

	//vykreslenie tučných čiar
	doLine({
		points: pointsBold,
		borderWidth: width * 3,
		borderColor: c
	});
}
	

function doPolygon(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Polygon" + " bez pointov");

	var res = $.extend(_initDef(obj), obj);


	res.ctx.beginPath();

	var drawLines = function(points){
		var size = points.length;

		if(res.radius == 0 || isNaN(res.radius))
			each(points, (e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
			//points.forEach((e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
		else
			//points.forEach(function(e, i){
			each(points, (e, i) => {
				var v1, v2, l1, l2;
				if (i == 0) {
					v1 = points[i + 1].getClone().sub(e);
					v2 = e.getClone().sub(points[size - 1]);
					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(isNumber(res.radius)){
						l1 >>= 1;
						l2 >>= 1;
					}
					else{
						res.radius.replace("px", "");
						l1 = l2 = 1;
						res.radius = parseInt(res.radius);
					}
					res.ctx.moveTo(points[size - 1].x + v2.x * l2 * res.radius, points[size - 1].y + v2.y * l2 * res.radius);
					res.ctx.quadraticCurveTo(e.x, e.y, e.x + v1.x * l1 * res.radius, e.y + v1.y * l1 * res.radius);
				}
				else{
					v1 = points[(i + 1) % size].getClone().sub(e);
					v2 = e.getClone().sub(points[i - 1]);

					l1 = v1.getLength();
					l2 = v2.getLength();
					v2.div(l2);
					v1.div(l1);
					if(isNumber(res.radius)){
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
	
	if(isArray(res.points[0]))
		each(res.points, drawLines);
		//res.points.forEach(a => drawLines(a));
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
	var def = _checkPosAndSize(obj, OBJECT_RECT);

	if(isDefined(obj[ATTRIBUTE_RADIUS])){
		if(isNumber(obj[ATTRIBUTE_RADIUS]))
			obj[ATTRIBUTE_RADIUS] = {
				tl: obj[ATTRIBUTE_RADIUS],
				tr: obj[ATTRIBUTE_RADIUS],
				br: obj[ATTRIBUTE_RADIUS],
				bl: obj[ATTRIBUTE_RADIUS]};
		else
			each(def[ATTRIBUTE_RADIUS], (e, i) => obj[ATTRIBUTE_RADIUS][i] = obj[ATTRIBUTE_RADIUS][i] || def[ATTRIBUTE_RADIUS][i]);
	}

	var res = _remakePosAndSize(def, obj);

	res.ctx.beginPath();
	res.ctx.moveTo(res.x + res[ATTRIBUTE_RADIUS].tl, res.y);
	res.ctx.lineTo(res.x + res.width - res[ATTRIBUTE_RADIUS].tr, res.y);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y, res.x + res.width, res.y + res[ATTRIBUTE_RADIUS].tr);
	res.ctx.lineTo(res.x + res.width, res.y + res.height - res[ATTRIBUTE_RADIUS].br);
	res.ctx.quadraticCurveTo(res.x + res.width, res.y + res.height, res.x + res.width - res[ATTRIBUTE_RADIUS].br, res.y + res.height);
	res.ctx.lineTo(res.x + res[ATTRIBUTE_RADIUS].bl, res.y + res.height);
	res.ctx.quadraticCurveTo(res.x, res.y + res.height, res.x, res.y + res.height - res[ATTRIBUTE_RADIUS].bl);
	res.ctx.lineTo(res.x, res.y + res[ATTRIBUTE_RADIUS].tl);
	res.ctx.quadraticCurveTo(res.x, res.y, res.x + res[ATTRIBUTE_RADIUS].tl, res.y);
	res.ctx.closePath();

	_process(res);
}

function doLine(obj){
	if(isUndefined(obj.points))
		Logger.error("chce sa vykresliť " + "Line" + " bez pointov");

	if(!isArray(obj.points[0]) && obj.points.length < 2)
		Logger.error("chce sa vykresliť " + "Line" + " s 1 bodom");

	var res = $.extend(_initDef(obj), obj),
		v1, v2, l1, l2;

	res.ctx.beginPath();

	var drawLines = function(points){
		if(isNaN(points[0])){
			if(res.radius == 0 || isNaN(res.radius))
				//points.forEach((e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y));
				each(points, (e, i) => i ? res.ctx.lineTo(e.x, e.y) : res.ctx.moveTo(e.x, e.y))
			else
				//points.forEach(function(e, i){
				each(points, (e, i) => {
					if(i == 0)
						res.ctx.moveTo(e.x, e.y);
					else if(i + 1 < points.length){
						v1 = points[i + 1].getClone().sub(e);
						v2 = e.getClone().sub(points[i - 1]);
						l1 = v1.getLength();
						l2 = v2.getLength();
						v2.div(l2);
						v1.div(l1);
						if(isNumber(res.radius)){
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

	if(isArray(res.points[0]))
		//res.points.forEach(a => drawLines(a));
		each(res.points, drawLines);
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
	//points.forEach((e, i) => i == 0 ? ctx.moveTo(e.x, e.y) : ctx.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y));
	each(points, (e, i) => i == 0 ? ctx.moveTo(e.x, e.y) : ctx.quadraticCurveTo(e[0].x, e[0].y, e[1].x, e[1].y));
	ctx.stroke();
}

function fillText(text, x, y, size = DEFAULT_FONT_SIZE, color = DEFAULT_FONT_COLOR, offset = 0, align = FONT_ALIGN_NORMAL, ctx = context){
	ctx.font = size + "pt " + DEFAULT_FONT;
	ctx.fillStyle = color;

	if(align == FONT_ALIGN_NORMAL){
		ctx.textAlign = FONT_HALIGN_LEFT;
		ctx.textBaseline = FONT_VALIGN_TOP;
		if(isArray(offset))
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
	if(isArray(val))
		//val.forEach(function(e){
		each(val, e => {
			if(isArray(e))
				//e.forEach(a => max = Math.max(calcTextWidth(a), max));
				each(e, a => max = Math.max(calcTextWidth(a), max));
			else
				max = Math.max(calcTextWidth(e), max);
		});
	else
		return calcTextWidth(val);
	return max;
}

function resetCanvas(ctx = context){
	CanvasManager.clearCanvas(ctx);
}

function initCanvasSize(c = canvas){
	CanvasManager.setCanvasSize(c);
}

function setShadow(variable){
	if(variable)
		CanvasManager.setShadow(context, DEFAULT_SHADOW_OFFSET, DEFAULT_SHADOW_OFFSET, "black", DEFAULT_SHADOW_BLUR);
	else
		CanvasManager.setShadow(context, 0, 0, "black", 0);
}


function setLineDash(variable){
	if(variable)
		CanvasManager.setLineDash(context, 15, 5);
	else
		CanvasManager.setLineDash(context, 1);
}


function canvasToImage(canvas) {
	return CanvasManager.canvasToImage(canvas);
	/*
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	image.width = canvas.width;
	image.height = canvas.height;
	return image;
	*/
}

function imageToCanvas(image) {
	return CanvasManager.imageToCanvas(image)
	/*
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);
	return canvas;
	*/
}

function calcTextWidth(value, font = false){
	return CanvasManager.calcTextWidth(context, value, font);
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
		center: false,
		joinType: LINE_JOIN_MITER,
		lineStyle: LINE_STYLE_NORMAL,
		lineType: JOIN_LINEAR,
		lineDash: [],
		bgImage: false
	};
	def["draw"] = isDefined(obj.borderColor) || isDefined(obj.borderWidth);
	def["fill"] = isDefined(obj.fillColor);

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

	if(isDefined(res["size"])){
		if(isNumber(res["size"])){
			res["width"] = res["size"];
			res["height"] = res["size"];
		}
		else if(isArray(res["size"])){
			res["width"] = res["size"][0];
			res["height"] = res["size"][1];
		}
		else{
			res["width"] = res["size"].x;
			res["height"] = res["size"].y;
		}
	}

	if(isDefined(res["position"])){
		if(isNumber(res["position"])){
			res["x"] = res["position"];
			res["y"] = res["position"];
		}
		else if(isArray(res["position"])){
			res["x"] = res["position"][0];
			res["y"] = res["position"][1];
		}
		else{
			res["x"] = res["position"].x;
			res["y"] = res["position"].y;
		}
	}

	if(res["center"]){
		res["x"] -= res["width"] >> 1;
		res["y"] -= res["height"] >> 1;
	}
	return res;
}

function saveCanvasAsFile(){
	saveImage("canvas_screen_shot", canvas.toDataURL());
}

function _process(res){
	if(res.shadow && Options.shadows)
		setShadow(res.shadow);

	if(res.bgImage){
		res.ctx.save();
		res.ctx.clip();
		if(res.bgImage instanceof HTMLImageElement)
			res.ctx.drawImage(res.bgImage, res.x, res.y, res.width, res.height);
		else
			res.ctx.drawImage(res.bgImage.img, res.bgImage.x, res.bgImage.y, res.bgImage.w, res.bgImage.h, res.x, res.y, res.width, res.height);
		/*
		if(isObject(res.bgImage))
			res.ctx.drawImage(res.bgImage.img, res.bgImage.x, res.bgImage.y, res.bgImage.w, res.bgImage.h, res.x, res.y, res.width, res.height);
		else
			res.ctx.drawImage(res.bgImage, res.x, res.y, res.width, res.height);
		*/
		res.ctx.restore();
	}
	else if (res.fill){
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
