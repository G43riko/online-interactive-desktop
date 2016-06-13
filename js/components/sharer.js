class Sharer{
	constructor(){
		this._id = false;
		this._socket = false;
	}

	startShare(password = "1234", limit = 100){
		this._socket = io();

		var inst = this,
			data = {
				res: {
					x: window.innerWidth,
					y: window.innerHeight
				},
				pass: password,
				limit: limit
			};

		this._socket.emit('startShare', JSON.stringify(data));

		this._socket.on('notification', function(msg){
			data = JSON.parse(msg);
			console.log(data["msg"]);
		});

		this._socket.on('confirmShare', function(msg){
			var data = JSON.parse(msg);
			this._link = "http://192.168.0.139:3000/watch?id=" + data["id"];
			console.log("zdiela sa na adrese: " + this._link);
			inst._id = data["id"];
		});

		this._socket.on('getAllData', function(recieveData){
			console.log("prišla žiadosť o odoslanie všetkých dát");
			var recData = JSON.parse(recieveData);
			var data = {
				id: inst._id,
				content: inst._getContent(),
				target: recData.target
			};
			inst._socket.emit('sendAllData', JSON.stringify(data));
		});
	}

	_getContent(){
		return Scene.toString();
	}

	objectChange(o, action, keys){
		if(!this._socket)
			return;
		//console.log("vola sa akcia");
		var data;
		switch(action ){
			case ACTION_MOVE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer,
						oX: o.position.x,
						oY: o.position.y,
						oW: o.size.x,
						oH: o.size.y
					}
				};
				break;
			case ACTION_CHANGE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer,
						keys: {}
					}
				};
				keys.forEach((e, i) => data.msg.keys["i"] = o[i]);
				break;
			case ACTION_DELETE:
				data = {
					id: this._id,
					msg:{
						action: action,
						oId: o.id,
						oL: o.layer
					}
				};
				break;
			case ACTION_CREATE:
				data = {
					id: this._id,
					msg: {
						action: action,
						o: o
					}
				};
				break;
			default:
				Logger.error("nastala chyba lebo sa chce vykonať neznáma akcia: " + action);
				return;
		}
		this._socket.emit('action', JSON.stringify(data));
	}

	write(msg){
		this._socket.emit('broadcastMsg', JSON.stringify({id: this._id, msg: msg}));
	}
}