var connections = {};
var tmpData = {};
var ides = [];

module.exports.getUserId = function(){
	return Math.floor(Math.random() * 100000);
};



module.exports.startShare = function (id, socket, data){
	connections[id] = {
		owner: socket,
		id: id,
		startTime: Date.now(),
		resolution: data["res"],
		password: data["pass"],
		limit: data["limit"],
		watchers: [],
		realTime: data["realTime"],
		detailMovement: data["detailMovement"],
		share: {
			menu: data["share"]["menu"],
			paints: data["share"]["paints"],
			layers: data["share"]["layers"],
			creator: data["share"]["creator"],
			objects: data["share"]["objects"]
		}
	};
};

module.exports.setTmpData = function(data){
	tmpData[data["userId"]] = data;
	//console.log("nastavili sa tmp data: ", data);
	return data["userId"];
};

module.exports.setUpWatcher = function(socket, userId){
	var data = tmpData[userId];
	connections[data["shareId"]].watchers[socket.id] = {
		resolution: {
			x: data["innerWidth"],
			y: data["innerHeight"]
		},
		nickName: data["nickName"],
		show: {
			timeLine: data["timeLine"],
			chat: data["showChat"]
		},
		changeResolution: data["changeResolution"],
		valid: false,
		socket: socket,
		connected: true
	};
};

module.exports.callLogInit = function(func){
	func(connections);
};

module.exports.isSetPassword = function(id){
	return connections[id].password !== "";
};

module.exports.isNickNameAvailable = function(id, nick){
	return true;
};

module.exports.getWatchOptions = function(watcher){
	return {
		nickName: watcher["nickName"],
		changeResolution: watcher["changeResolution"],
		show: watcher["show"]
	}
};

module.exports.getShareOptions = function(id){
	var connection = connections[id];
	return {
		share: {
			menu : connection["share"]["menu"],
			paints : connection["share"]["paints"],
			layers : connection["share"]["layers"],
			creator : connection["share"]["creator"],
			objects : connection["share"]["objects"]
		}
	}
};

module.exports.startWatch = function (id, socket, data){
	connections[id].watchers[socket.id] = {
		resolution: data["res"],
		valid: false,
		socket: socket,
		connected: true
	};
};

module.exports.disconnect = function(socket, isWatcher, isSharer){
	for(var i in connections){
		if(connections.hasOwnProperty(i)){
			if(connections[i].owner.id == socket.id){
				//ODPOJIL SA SHARER
				for(var j in connections[i].watchers)
					if(connections[i].watchers.hasOwnProperty(j))
						connections[i].watchers[j].socket.emit("endShare", "endShare");
				if(typeof isSharer === "function")
					isSharer(socket, connections[i]);
				console.log("SHARER s id " + socket.id + " sa odpojil");
				break;
			}
			else{
				if(typeof connections[i].watchers[socket.id] !== "undefined"){
					//ODPOJIL SA WATCHER
					delete connections[i].watchers[socket.id];
					console.log("watcher s id " + socket.id + " sa odpojil");
					if(typeof isWatcher === "function")
						isWatcher(socket);
					break;
				}
			}
		}
	}
};


module.exports.existShare = function(chatId){
	return typeof connections[chatId] === "object";
};

module.exports.checkPassword = function(chatId, password){
	return password == connections[chatId].password;
};

module.exports.getOwner = function(chatId){
	return connections[chatId].owner;
};

module.exports.getWatcher = function(chatId, socket){
	return connections[chatId].watchers[socket.id || socket];
};

module.exports.getWatchers = function(chatId){
	return connections[chatId].watchers;
};