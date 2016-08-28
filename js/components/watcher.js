class WatcherManager{
	constructor(){
		WatcherManager._tryPasswordCounter = 0;
		WatcherManager._maxPasswordTries = 3;
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
		this._id = WatcherManager.processParameters();
		var inst = this,
			data = {
				resolution: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				id: this._id
			};
		this._socket.emit('startWatch', JSON.stringify(data));

		this._socket.on('chatMessage',function(msg){
			data = JSON.parse(msg);
			chatViewer.recieveMessage(data["text"], data["sender"]);
		});

		this._socket.on('notification', function(msg){
			data = JSON.parse(msg);
			Logger.notif("prijatá správa: " + data["msg"]);
			console.log(data["msg"]);
		});

		this._socket.on('auth', function(){
			//ZOBRAZI SA HESLO AK JE ZADANE
			var diff = WatcherManager._maxPasswordTries - WatcherManager._tryPasswordCounter;
			if(WatcherManager._tryPasswordCounter){

				var text = "Bolo zadané zlé heslo\n";
				text += "Prajete si skusiť zadať heslo znovu?\n";
				text += "Počet zostávajúcich pokusov: " + diff;
				if(!diff || !confirm(text)){
					Logger.notif("nepodarilo sa pripojiť k zdielaniu");
					return false;
				}
			}
			var pass = prompt("Prosím zadajte heslo pre zdielanie");
			console.log("odosiela sa heslo", WatcherManager._tryPasswordCounter);


			WatcherManager._tryPasswordCounter++;
			inst._socket.emit('completeAuth', JSON.stringify({passwd: pass, id: inst._id}));
		});

		this._socket.on('endShare', function(){
			console.log("sharer je offline");
		});

		this._socket.on("changeCreator", function(msg){
			data = JSON.parse(msg);
			Creator.setOpt(data.key, data.val);
		});

		this._socket.on("action", function(msg){
			WatcherManager.processOperation(JSON.parse(msg));
		});

		this._socket.on("paintAction", function(msg){
			WatcherManager.processPaintAction(JSON.parse(msg));
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

		this._socket.on('sendAllData', msg => WatcherManager.processContent(JSON.parse(msg)));
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	sendMessage(text, sender){
		var data = {
			id: this._id,
			msg: {
				text: text,
				sender: sender
			}
		};
		this._socket.emit('chatMessage', JSON.stringify(data));
	}

	static processContent(content){
		console.log("content: ", content);
		var options = content.shareOptions;

		if(options.share.objects)
			Scene.fromObject(content.scene);
		if(options.share.creator)
			Creator.fromObject(content.creator);
		if(options.share.paints)
			Paints.fromObject(content.paint);

		Menu.visible = options.share.menu;
		Creator.visibleView = options.share.menu;
		Options.setOpt("showLayersViewer", options.share.layers);

		Logger.notif("Všetky dáta boly úspešne načítané");
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