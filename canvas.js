function resetCanvas(){
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);
};

function initCanvasSize(){
	var tmpC = $(canvas);
	canvas.width = tmpC.width();
	canvas.height = tmpC.height();
}

function setShadow(variable){
	if(variable){
		context.shadowBlur = 20;
		context.shadowOffsetX = 5;
		context.shadowOffsetY = 5;
	}
	else{
		context.shadowBlur = 0;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
	}
}