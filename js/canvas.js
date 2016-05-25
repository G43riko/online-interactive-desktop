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
		if (typeof radius === 'number')
			radius = {tl: radius, tr: radius, br: radius, bl: radius};
		else {
			var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
			for (var i in defaultRadius)
					radius[i] = radius[i] || defaultRadius[i];
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