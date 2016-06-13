class Watcher{
	constructor(){
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
		console.log(data);
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

		this._socket.on("action", function(msg){
			Watcher.processOperation(JSON.parse(msg));
		});

		this._socket.on('sendAllData', msg => inst.processContent(JSON.parse(JSON.parse(msg))));
	}

	processContent(content){
		content.forEach(e => Creator.create(e));
	}

	static processOperation(data){
		//console.log("vykonáva sa akcia");
		//console.log(data);
		var obj;
		switch(data.action){
			case ACTION_MOVE:
				obj = Scene.get(data.oL, data.oId);
				obj.position.set(data.oX, data.oY);
				obj.size.set(data.oW, data.oH);
				break;
			case ACTION_DELETE:
				Scene.remove(Scene.get(data.oL, data.oId), data.oL, false);
				break;
			case ACTION_CHANGE:
				obj = Scene.get(data.oL, data.oId);
				$.each(data.keys, (i, e) => obj[i] = e);
				break;
			case ACTION_CREATE:
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