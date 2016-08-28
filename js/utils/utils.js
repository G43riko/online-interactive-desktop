function round(number, value = DEFAULT_ROUND_VAL){
	if(value == 1)
		return number;
	return Math.floor(number / value) * value;
}

function isIn(obj, data){
	//return arguments.some((e, i) => i && e === obj);
	var i;
	if(isArray(data)){
		for(i=0 ; i<data.length ; i++)
			if(data[i] == obj)
				return true;
	}
	else
		for(i=1 ; i<arguments.length ; i++)
			if(arguments[i] === obj)
				return true;

	return false;
}

function nvl(obj1, obj2){
	return obj1 ? obj1 : obj2;
}

function roughSizeOfObject(object) {
	var objectList = [];
	var stack = [object];
	var bytes = 0;

	while (stack.length) {
		var value = stack.pop();
		if(typeof value === 'boolean')
			bytes += 4;
		else if(typeof value === 'string')
			bytes += value.length << 1;
		else if(typeof value === 'number')
			bytes += 8;
		else if(typeof value === 'object' && objectList.indexOf( value ) === -1){
			objectList.push(value);
			for(var i in value)
				if(value.hasOwnProperty(i))
					stack.push(value[i]);
		}
	}
	return bytes;
}

var isUndefined 	= e => typeof e === "undefined",
	isDefined 		= e => typeof e !== "undefined",
	isFunction 		= e => typeof e === "function",
	isNumber		= e => typeof e === "number",
	isString		= e => typeof e === "string",
	isObject		= e => typeof e === "object",
	isArray			= e => Array.isArray(e),
	isNull			= e => e === null,
	isEmptyObject   = e => e && Object.keys(e).length === 0 && e.constructor === Object,
	isEmptyArray    = e => isArray(e) && e.length === 0,
	getLength		= function(obj){var counter = 0; each(obj, e => counter++); return counter;},
	isSharing		= () => typeof Sharer !== "undefined" && Sharer.isSharing,
	isInt 			= e => Number(e) === e && e % 1 === 0,
	isFloat 		= e => Number(e) === e && e % 1 !== 0,
	callIfFunc 		= e => isFunction(e) ? e() : false,
	angleBetween 	= (a, b) => Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
	getClassOf 		= Function.prototype.call.bind(Object.prototype.toString);

function each(obj, func, thisArg = false){
	var i;
	if(Array.isArray(obj)){
		if(thisArg)
			for(i=0 ; i<obj.length ; i++)
				func.call(thisArg, obj[i], i, obj);
		else
			for(i=0 ; i<obj.length ; i++)
				func(obj[i], i, obj);
	}
	else{
		if(thisArg){
			for(i in obj)
				if(obj.hasOwnProperty(i))
					func.call(thisArg, obj[i], i, obj);
		}
		else
			for(i in obj)
				if(obj.hasOwnProperty(i))
					func(obj[i], i, obj);
	}
}

function extendObject(){
	for(var i=1; i<arguments.length; i++)
		for(var key in arguments[i])
			if(arguments[i].hasOwnProperty(key))
				arguments[0][key] = arguments[i][key];
	return arguments[0];
}

Movement = {
	move: function(o, x, y){
		if(isDefined(o.locked) && o.locked)
			return;

		if(isDefined(o.selectedConnector) && Creator.operation == OPERATION_DRAW_JOIN && o.selectedConnector){

		}
		else if(isDefined(o.moveType)){
			if(Creator.operation == OPERATION_DRAW_LINE && Menu.isToolActive()){
				
			}
			else{
				var oldPos = o.position.getClone();
				var oldSize = o.size.getClone();
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
						break
				}
				EventHistory.addObjectMoveAction(o, oldPos, oldSize, o.moveType);
			}
		}
		else if(isDefined(o.movingPoint)){
			var intVal = 0;
			if(o.movingPoint < 0)
				o.points.forEach(a => a.add(x, y));
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

		if(isDefined(Sharer) && Sharer.isSharing)
			Sharer.objectChange(o, ACTION_OBJECT_MOVE);

	}
};

function closeDialog(){
	//$("#modalWindow > div").each((e) => $(e).hide());

	$("#modalWindow > div").each(function(){
		$(this).hide();
	});
	$("#colorPalete").undelegate();
	$("#modalWindow").hide();
	$("canvas").removeClass("blur");
}

function getText(text, position, size, func, thisArg){
	var T, x = $(document.createElement("INPUT"));

	if (arguments.length > 1)
		T = thisArg;

	x.attr({
		type: "text",
		value: text,
		id: "staticInput"
	}).css({
		left: position.x + 'px',
		top: position.y + 'px',
		width: size.x,
		height: size.y,
		fontSize: size.y * 0.6
	}).blur(function(){
		func.call(T, x.val());
		x.remove();
		draw();
	}).keyup(function(e){
		if(e.keyCode == ENTER_KEY){
			x.onblur = false;
			func.call(T, x.val());
			x.remove();
			draw();
		}
	}).appendTo("body");
	x.select().focus();
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";expires="+ d.toUTCString();
}

function getFormattedDate() {
	var date = new Date();
	return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function getCookie(cname) {
	var name = cname + "=",
		ca = document.cookie.split(';'),
		i, c;
	for(i = 0; i <ca.length; i++) {
		c = ca[i];
		while (c.charAt(0)==' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length,c.length);
	}
	return "";
}

function drawBorder(o, selectors = {tc: 1, bc: 1, cl: 1, cr: 1, br: 1}){
	if(!o.selected && o.name != "Paint")
		return;

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
	each(obj, e => result.push(e));
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
	vec = vec.getClone().mul(obj.size);
	doArc({
		x: obj.position.x + vec.x,
		y: obj.position.y + vec.y,
		fillColor: "brown",
		center: true,
		width: 10,
		height: 10
	});
}

function drawSelectArc(x, y, color = SELECTOR_COLOR, size = SELECTOR_SIZE << 1 	, dots = true){
	doArc({
		x: x,
		y: y,
		center: true,
		width: size,
		height: size,
		fillColor: color,
		borderWidth: DEFAULT_STROKE_WIDTH << 1,
		lineDash:  dots ? [15, 5] : [],
		borderColor: "black"

	});
}

function getMousePos(canvasDom, mouseEvent) {
	var rect = canvasDom.getBoundingClientRect();
	return {
		x: mouseEvent["touches"][0].clientX - rect.left,
		y: mouseEvent["touches"][0].clientY - rect.top
	};
}

class EventManager{
	constructor(event, time){
		this._event = event;
		this._time = time;
		this._timeOut = false;
		this._lastTime = window["performance"].now();
	}

	_callEvent(inst = this){
		inst._event();
		if(inst._timeOut){
			clearTimeout(inst._timeOut);
			inst._timeOut = false;
		}
		inst._lastTime = window["performance"].now();
	}

	_setTimeOut(diff){
		if(this._timeOut)
			return;
		var inst = this;
		this._timeOut = setTimeout(function(){inst._callEvent(inst);}, this._time - diff);
	}

	callIfCan(){
		var diff = window["performance"].now() - this._lastTime;
		diff > this._time ? this._callEvent() : this._setTimeOut(diff);
	}
}