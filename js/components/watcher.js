class Watcher{
	constructor(){
		this._mouseData = {
			posX: window.innerWidth << 1,
			posY: window.innerHeight << 1,
			buttonDown: false
		};

		this._canvas = document.getElementById("pointerCanvas");
		var c = $(document.getElementById("myCanvas"));
		this._canvas.width = c.width();
		this._canvas.height = c.height();
		this._context 		= this._canvas.getContext('2d');


		this._socket = io();
		this._id = Watcher.processParameters();
		var inst = this,
			data = {
				resolution: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				id: this._id
			};
		this._socket.emit('startWatch', JSON.stringify(data));

		this._socket.on('notification', function(msg){
			data = JSON.parse(msg);
			console.log(data["msg"]);
		});

		this._socket.on('auth', function(){
			//ZOBRAZI SA HESLO AK JE ZADANE
			console.log("odosiela sa heslo");
			inst._socket.emit('completeAuth', JSON.stringify({passwd: "pass", id: inst._id}));
		});

		this._socket.on('endShare', function(){
			console.log("sharer je offline");
		});

		this._socket.on("changeCreator", function(msg){
			data = JSON.parse(msg);
			Creator.set(data.key, data.val);
		});

		this._socket.on("action", function(msg){
			Watcher.processOperation(JSON.parse(msg));
		});

		this._socket.on("paintAction", function(msg){
			Watcher.processPaintAction(JSON.parse(msg));
		});



		this._socket.on("mouseData", function(msg){
			inst._mouseData = JSON.parse(msg);
			inst._context.clearRect(0, 0, inst._canvas.width, inst._canvas.height);
			doArc({
				x: inst._mouseData.posX - 20,
				y: inst._mouseData.posY - 20,
				fillColor: "rgba(255,0,0,0.1)",
				width: 40,
				height: 40,
				ctx: inst._context
			})
		});

		this._socket.on('sendAllData', msg => inst.processContent(JSON.parse(JSON.parse(msg))));
	}

	processContent(content){
		content.forEach(e => Creator.create(e));
	}

	static processPaintAction(data){
		switch(data.action){
			case ACTION_PAINT_ADD_POINT :
				Paints.addPoint(new GVector2f(data.pX, data.pY), data.layer);
				break;
			case ACTION_PAINT_BREAK_LINE :
				Paints.breakLine(data.layer);
				break;
			case ACTION_PAINT_CLEAN :
				Paints.clean(data.layer);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data.action);
		}
		draw();
	}

	static processOperation(data){
		//console.log("vykonáva sa akcia");
		var obj;
		switch(data.action){
			case ACTION_OBJECT_MOVE:
				obj = Scene.get(data.oL, data.oId);
				obj.position.set(data.oX, data.oY);
				obj.size.set(data.oW, data.oH);
				break;
			case ACTION_OBJECT_DELETE:
				Scene.remove(Scene.get(data.oL, data.oId), data.oL, false);
				break;
			case ACTION_OBJECT_CHANGE:
				obj = Scene.get(data.oL, data.oId);
				each(data.keys, (e, i) => obj[i] = e);
				break;
			case ACTION_OBJECT_CREATE:
				Creator.create(data.o);
				break;
			default :
				Logger.error("bola prijatá neznáma akcia: " + data.action);
		}
		draw();
	}

	static processParameters(){
		var query = window.location.search.substring(1),
			vars = query.split("&");

		for (var i = 0; i < vars.length; i++)
			if (vars[i].indexOf("id") >= 0)
				return vars[i].split("=")[1];
		return false;
	}
}