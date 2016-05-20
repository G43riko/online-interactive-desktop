function GVector2f(x, y){
	this.x = x;
	this.y = y;
};

GVector2f.prototype.dist = function(x, y){
	return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
}

GVector2f.prototype.set = function(x, y){
	this.x = x;
	this.y = y;
}



Movement = {};
Movement.move = function(o, x, y){
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
	else{
		o.position.x += x;
		o.position.y += y;
	}
}

function deselectAll(object = false){
	selectedObjects.clear();
	if(object)
		selectedObjects.add(object);
}

function updateSelectedObjectView(object){
	var container = $("#cont_select_obj");
	container.find("#posX").text(object.position.x);
	container.find("#posY").text(object.position.y);
	container.find("#sizeX").text(object.size.x);
	container.find("#sizeY").text(object.size.y);
	container.find("#color").css("backgroundColor", object.color).text(object.color);
}

function isKeyDown(key){
	return keys.hasOwnProperty(key) && keys[key];
}

function isButtonDown(button){
	return buttons.hasOwnProperty(button) && buttons[button];
}

function drawBorder(object){
	context.lineWidth = object.borderWidth;
	context.strokeStyle = object.borderColor;
	context.strokeRect(object.position.x, object.position.y, object.size.x, object.size.y);

	drawSelectArc(object.position.x + object.size.x / 2, object.position.y, SELECTOR_COLOR, SELECTOR_SIZE);
	drawSelectArc(object.position.x, object.position.y + object.size.y / 2, SELECTOR_COLOR, SELECTOR_SIZE);
	drawSelectArc(object.position.x + object.size.x / 2, object.position.y + object.size.y, SELECTOR_COLOR, SELECTOR_SIZE);
	drawSelectArc(object.position.x + object.size.x, object.position.y + object.size.y / 2, SELECTOR_COLOR, SELECTOR_SIZE);

	drawSelectArc(object.position.x + object.size.x, object.position.y + object.size.y, SELECTOR_COLOR, SELECTOR_SIZE);
}

function drawSelectArc(x, y, color, size){
	context.beginPath();
	context.fillStyle = color;
	context.arc(x, y, size, size, 0, 2 * Math.PI);
	context.fill()

	context.lineWidth = 2;
	context.strokeStyle = "black";
	context.arc(x, y, size, size, 0,  Math.PI * 2);
	context.stroke();
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
			context.lineWidth = width * 2;
			context.moveTo(i,0);
			context.lineTo(i,canvas.height);
			context.lineWidth = width;
		}
		context.moveTo(i,0);
		context.lineTo(i,canvas.height);
	}
	i = 0;
	while((i += dist) < canvas.height){
		if(strong > 0 && i % strong == 0){
			context.lineWidth = width * 2;
			context.moveTo(0, i);
			context.lineTo(canvas.width, i);
			context.lineWidth = width;
		}
		context.moveTo(0, i);
		context.lineTo(canvas.width, i);
	}
	context.stroke();
}