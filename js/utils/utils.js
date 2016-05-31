var getClassOf = Function.prototype.call.bind(Object.prototype.toString);

function isInt(n){
	return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
	return Number(n) === n && n % 1 !== 0;
}

function angleBetween(a, b) {
	return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
}

Movement = {
	move: function(o, x, y){
		if(typeof o.locked !== "undefined" && o.locked)
			return;

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
					if(!o.minSize || o.size.x + x >= o.minSize.x)
						o.size.x += x;
					if(!o.minSize || o.size.y + y >= o.minSize.y)
						o.size.y += y;
					break;
			}
		}
		else if(o.movingPoint !== undefined){
			var intVal = 0;
			if(o.movingPoint < 0){
				o.points.forEach(function(e){
					e.add(x, y);
				});
			}
			else if(isInt(o.movingPoint)){
				o.points[o.movingPoint].x += x;
				o.points[o.movingPoint].y += y;
			}
			else{
				console.log(intVal);
				intVal = parseInt(o.movingPoint) + 1;
				o.points.splice(intVal, 0, new GVector2f((o.points[intVal - 1].x + (o.points[(intVal % o.points.length)].x) >> 1),
														 (o.points[intVal - 1].y + (o.points[(intVal % o.points.length)].y) >> 1)));
				o.movingPoint = intVal;
			}
			Entity.findMinAndMax(o.points, o.position, o.size);
		}
		else{
			o.position.x += x;
			o.position.y += y;
		}
	}
};

function drawBorder(o, selectors = {tc: true, bc: true, cl: true, cr: true, br: true}){
	context.save();


	context.lineWidth = DEFAULT_STROKE_WIDTH << 1;
	setLineDash(true);

	drawRect(o.position.x, o.position.y, o.size.x, o.size.y, o.borderColor);

	if(selectors.hasOwnProperty("tc"))
		drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y);
	if(selectors.hasOwnProperty("cl"))
		drawSelectArc(o.position.x, o.position.y + (o.size.y >> 1));
	if(selectors.hasOwnProperty("bc"))
		drawSelectArc(o.position.x + (o.size.x >> 1), o.position.y + o.size.y);
	if(selectors.hasOwnProperty("cr"))
		drawSelectArc(o.position.x + o.size.x, o.position.y + (o.size.y >> 1));

	if(selectors.hasOwnProperty("br"))
		drawSelectArc(o.position.x + o.size.x, o.position.y + o.size.y);
	context.restore();
}

function shadeColor1(color, percent) {  // deprecated. See below.
	var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

function objectToArray(obj){
	var result = [];
	for(var i in obj)
		if(obj.hasOwnProperty(i)){
			obj[i]["key"] = i;
			result.push(obj[i]);
		}

	return result;
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

function drawSelectArc(x, y, color = SELECTOR_COLOR, size = SELECTOR_SIZE, dots = true){
	context.save();
	setLineDash(dots);

	context.beginPath();
	context.fillStyle = color;
	context.arc(x, y, size, size, 0, PI2);
	context.fill();

	context.strokeStyle = "black";
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
