/*
	compatible:	forEach, canvas 14.9.2016
*/
class WatcherManager{
	constructor(){
		WatcherManager._tryPasswordCounter = 0;
		WatcherManager._maxPasswordTries = 3;

		this._mouseData = {
			posX: window.innerWidth << 1,
			posY: window.innerHeight << 1,
			buttonDown: false
		};
		this._connected = false;

		this._canvas = document.getElementById("pointerCanvas");
		var c = $(document.getElementById("myCanvas"));
		this._canvas.width = c.width();
		this._canvas.height = c.height();
		this._context 		= this._canvas.getContext('2d');


		this._socket = io();
		var data = WatcherManager.processParameters(),
			inst = this;



		this._id = data["id"];

		data["resolution"] = {
			x: window.innerWidth,
			y: window.innerHeight
		};


		//this._socket.emit('startWatch', data);
		this._socket.emit('createWatcher', {userId: data["userId"], shareId: data["id"]});

		this._socket.on('chatMessage', data => Panel.recieveMessage(data["text"], data["sender"]));
		this._socket.on('notification', data => Logger.notif("prijatá správa: " + data["msg"]));
		this._socket.on('auth', (data) => inst._authProcess(data));
		this._socket.on('endShare', () => console.log("sharer je offline"));
		this._socket.on("changeCreator", data => Creator.setOpt(data.key, data.val));
		this._socket.on("action", data => WatcherManager.processOperation(data));
		this._socket.on("paintAction", data => WatcherManager.processPaintAction(data));
		this._socket.on("mouseData", data => inst._mouseDataProcess(data));
		this._socket.on('sendAllData', data => inst._sendAllData(data));
		this._socket.on("processBuffer", data => inst._processBuffer(data));
		this._socket.on("endShare", data => inst._endShare(data));

		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	_processBuffer(data){
		console.log(data);
	}
	_endShare(data){
		Alert.danger("Zdielanie bolo ukončené");
	}

	_authProcess(data){
		if(!data.needPassword){
			this._socket.emit('completeAuth', {passwd: "", id: this._id});
			return;
		}
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
		this._socket.emit('completeAuth', {passwd: pass, id: this._id});
	}

	_sendAllData(data){
		console.log("content: ", data);
		WatcherManager.processContent(data);
		this._connected = true;
		Logger.notif("Všetky dáta boly úspešne načítané");
		draw();
	}

	_mouseDataProcess(data) {
		this._mouseData = data;
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		doArc({
			x: this._mouseData.posX - 20,
			y: this._mouseData.posY - 20,
			fillColor: "rgba(255,0,0,0.1)",
			width: 40,
			height: 40,
			ctx: this._context
		})
	}

	get pointerCanvas(){return this._canvas;}

	sendMessage(text, sender){
		var data = {
			id: this._id,
			msg: {
				text: text,
				sender: sender
			}
		};
		this._socket.emit('chatMessage', data);
	}

	static processContent(content){
		var shareOptions = content.shareOptions;
		var watchOptions = content.watchOptions;

		if(shareOptions.share.objects)
			Scene.fromObject(content.scene);
		if(shareOptions.share.creator)
			Creator.fromObject(content.creator);
		if(shareOptions.share.paints)
			Paints.fromObject(content.paint);


		if(watchOptions.show.chat){
			/*
			chatViewer = new ChatViewer(Project.title + "'s chat", watchOptions.nickName, sendMessage);
			chatViewer.show();
			*/
			Panel.startWatch(sendMessage);
		}

		if(watchOptions.show.timeLine)
			timeLine = new TimeLine();

		Project.autor = watchOptions.nickName;


		Menu.visible = shareOptions.share.menu;
		Creator.visibleView = shareOptions.share.menu;
		Options.setOpt("showLayersViewer", shareOptions.share.layers);
	}

	get connected(){return this._connected;}

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
			vars = query.split("&"),
			data = {};

		for (var i = 0; i < vars.length; i++)
			if (vars[i].indexOf("id") >= 0)
				data["id"] = vars[i].split("=")[1];
			else if (vars[i].indexOf("userId") >= 0)
				data["userId"] = vars[i].split("=")[1];
		return data;
	}
}