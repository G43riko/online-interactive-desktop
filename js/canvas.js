function resetCanvas(){
	context.fillStyle = DEFAULT_BACKGROUND_COLOR;
	context.fillRect(0, 0, canvas.width, canvas.height);
};

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