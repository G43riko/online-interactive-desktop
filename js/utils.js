var getClassOf = Function.prototype.call.bind(Object.prototype.toString);

class GVector2f{
	constructor(){
		if(arguments.length == 0){
			this.x = 0;
			this.y = 0;
		}
		else if(arguments.length == 1){
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		else if(arguments.length == 2){
			this.x = arguments[0];
			this.y = arguments[1];
		}
	}

	dist(){
		if(arguments.length == 1)
			return Math.sqrt(Math.pow(this.x - arguments[0].x, 2) + Math.pow(this.y - arguments[0].y, 2));
		else if(arguments.length == 2)
			return Math.sqrt(Math.pow(this.x - arguments[0], 2) + Math.pow(this.y - arguments[1], 2));
	}

	set(){
		if(arguments.length == 1){
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		else if(arguments.length == 2){
			this.x = arguments[0];
			this.y = arguments[1];
		}
	}
}

function isInt(n){
	return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
	return Number(n) === n && n % 1 !== 0;
}

Movement = {
	move: function(o, x, y){
		if(o.moveType !== undefined){
			switch(o.moveType){
				case 0:
					o.position.y += y;
					o.size.y -= y;
					break;
				case 1:
					o.size.x += x;
					break;
				case 2:
					o.size.y += y;
					break;
				case 3:
					o.position.x += x;
					o.size.x -= x;
					break;
				case 4:
					o.position.x += x;
					o.position.y += y;
					break;
				case 5:
					o.size.x += x;
					o.size.y += y;
					break;
			}
		}
		else if(o.movingPoint !== undefined && o.movingPoint >= 0){
			var intVal = 0;
			if(isInt(o.movingPoint)){
				o.points[o.movingPoint].x += x;
				o.points[o.movingPoint].y += y;
				o.findMinAndMax();
			}
			else{
				intVal = parseInt(o.movingPoint) + 1;
				o.points.splice(intVal, 0, new GVector2f((o.points[intVal - 1].x + (o.points[intVal].x) >> 1),
														 (o.points[intVal - 1].y + (o.points[intVal].y) >> 1)));
				o.findMinAndMax();
				o.movingPoint = intVal;
			}
		}
		else{
			o.position.x += x;
			o.position.y += y;
		}
	}
};

function deselectAll(object = false){
	selectedObjects.clear();
	if(object)
		selectedObjects.add(object);
}

function updateSelectedObjectView(object){
	/*
	var container = $("#cont_select_obj");
	container.find("#posX").text(object.position.x);
	container.find("#posY").text(object.position.y);
	container.find("#sizeX").text(object.size.x);
	container.find("#sizeY").text(object.size.y);
	container.find("#color").css("backgroundColor", object.color).text(object.color);
	*/
}

function drawBorder(o){
	context.lineWidth = o.borderWidth * 2;
	context.save();
	setLineDash(true);
	context.strokeStyle = o.borderColor;
	context.strokeRect(o.position.x, o.position.y, o.size.x, o.size.y);

	drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y);
	drawSelectArc(o.position.x, o.position.y + (o.size.y >> 1));
	drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y + o.size.y);
	drawSelectArc(o.position.x + o.size.x, o.position.y + (o.size.y >> 1));

	drawSelectArc(o.position.x + o.size.x, o.position.y + o.size.y);
	context.restore();
}

function drawSelectArc(x, y, color = SELECTOR_COLOR, size = SELECTOR_SIZE, dots = true){
	context.save();
	setLineDash(dots);
	context.beginPath();
	context.fillStyle = color;
	context.arc(x, y, size, size, 0, Math.PI << 1);
	context.fill();

	context.strokeStyle = "black";
	context.arc(x, y, size, size, 0, Math.PI << 1);
	context.stroke();
	context.restore();
}

function getMousePos(canvasDom, mouseEvent) {
	var rect = canvasDom.getBoundingClientRect();
	return {
		x: mouseEvent.touches[0].clientX - rect.left,
		y: mouseEvent.touches[0].clientY - rect.top
	};
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