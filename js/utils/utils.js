var getClassOf = Function.prototype.call.bind(Object.prototype.toString);

function round(number, value = DEFAULT_ROUND_VAL){
	if(value == 1)
		return number;
	return Math.floor(number / value) * value;
}

function isIn(obj){
	for(var i=1 ; i<arguments.length ; i++)
		if(arguments[i] === obj)
			return true;

	return false;
}

function isFunction(val){
	return typeof val === "function";
}

function callIfFunc(val){
	return isFunction(val) ? val() : false;
}

function isUndefined(val){
	return typeof val === "undefined";
}

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

		if(typeof o.selectedConnector !== "undefined" && Creator.operation == OPERATION_DRAW_JOIN && o.selectedConnector !== false){

		}
		else if(typeof o.moveType !== "undefined"){
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
					o.position.add(x, y);
					break;
				case 5:
					if(!o.minSize || o.size.x + x >= o.minSize.x)
						o.size.x += x;
					if(!o.minSize || o.size.y + y >= o.minSize.y)
						o.size.y += y;
					break;
			}
		}
		else if(typeof o.movingPoint !== "undefined"){
			var intVal = 0;
			if(o.movingPoint < 0){
				o.points.forEach(a => a.add(x, y));
			}
			else if(isInt(o.movingPoint))
				o.points[o.movingPoint].add(x, y);
			else{
				intVal = parseInt(o.movingPoint) + 1;
				o.points.splice(intVal, 0, o.points[intVal - 1].getClone().add(o.points[(intVal % o.points.length)]).br(1));
				o.movingPoint = intVal;
			}
			Entity.findMinAndMax(o.points, o.position, o.size);
		}
		else
			o.position.add(x, y);

		if(typeof Sharer !== "undefined")
			Sharer.objectChange(o, ACTION_MOVE);
	}
};

function drawBorder(o, selectors = {tc: 1, bc: 1, cl: 1, cr: 1, br: 1}){
	if(!o.selected && o.name != "Paint")
		return;
	context.save();

	//setLineDash(true);

	doRect({
		position: o.position,
		size: o.size,
		borderWidth: DEFAULT_STROKE_WIDTH << 1,
		lineDash:  [15, 5]
	});

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
	var num = parseInt(color.slice(1), 16),
		amt = Math.round(2.55 * percent), 
		R = (num >> 16) + amt, 
		G = (num >> 8 & 0x00FF) + amt,
		B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
							  (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
							  (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function hexToRGBA(color) {
	var num = parseInt(color.slice(1), 16);
	return [num >> 16, num >> 8 & 0x00FF, num & 0x0000FF];
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

function drawConnector(vec, obj){
	context.save();
	context.beginPath();
	vec = vec.getClone().mul(obj.size);
	context.fillStyle = "brown";
	context.arc(obj.position.x + vec.x, obj.position.y + vec.y, 5, 0, PI2);
	context.fill();
	context.restore();
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