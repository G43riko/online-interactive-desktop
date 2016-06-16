var express 	= require('express'),
	app 		= express(),
	http 		= require('http').Server(app),
	io 			= require('socket.io')(http),
	url 		= require('url'),
	connections = {};

const MAX_ID_VALUE 	= 10;
const PORT 			= 3000;

app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));

//app.get('/', (req, res) => res.sendFile('/index.html' , { root : __dirname}));
app.get('/', function(req, res) {
	res.sendFile('/index.html' , { root : __dirname});
});

//app.get('/watch', (req, res) => res.sendFile('/watch.html' , { root : __dirname}));
app.get('/watch', function(req, res){
	res.sendFile('/watch.html' , { root : __dirname});
});

function getId(){
	return Math.floor(Math.random() * MAX_ID_VALUE);
}

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on("completeAuth", completeAuth);
	socket.on("broadcastMsg", broadcastMsg);
	socket.on("sendAllData", sendAllData);
	socket.on("paintAction", paintAction);
	socket.on("startShare", startShare);
	socket.on("startWatch", startWatch);
	socket.on('disconnect', disconnect);
	socket.on('mouseData', mouseData);
	socket.on("action", action);
});

function writeToWatchers(watchers, type, msg){
	for(var i in watchers)
		if(watchers.hasOwnProperty(i))
			watchers[i].socket.emit(type, msg);
}

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
});

var startShare, startWatch, completeAuth, broadcastMsg, sendAllData, disconnect, action, mouseData, paintAction;

/*
 * dostane správu že uživaťel chce začať zdielať obrazovku
 */
startShare = function(msg){
	var id = getId(),
		data = JSON.parse(msg),
		socket = this;
	console.log("začina zdielať: ", data, "id: " + id);
	connections[id] = {
		owner: socket,
		id: id,
		resolution: data["res"],
		password: data["pass"],
		limit: data["limit"],
		watchers: []
	};
	socket.emit("confirmShare", JSON.stringify({id: id}));
};


/*
 * dostane spravu že client chce začať sledovať obrazovku
 */
startWatch = function(msg){
	var data = JSON.parse(msg),
		socket = this;
	console.log("client s id " + socket.id + " chce sledovať plochu");
	connections[data["id"]].watchers[socket.id] = {
		resolution: data["res"],
		valid: false,
		socket: socket,
		connected: true
	};

	if(connections[data["id"]].password != "")
		socket.emit("auth", "zadaj heslo");
	else
		socket.emit("notification", JSON.stringify({msg: "pripojenie bolo uspešne - bez zadanie hesla"}));
	connections[data["id"]].owner.emit("notification", JSON.stringify({msg: "novy watcher sa pripojil"}));
};


/*
 * client úspešne zadá heslo
 */
completeAuth = function(msg){
	var data = JSON.parse(msg),
		socket = this;

	console.log("dokoncuje sa authentifikacia s uživatelom: " + socket.id);

	if(data["passwd"] == connections[data["id"]].password || true){
		socket.emit("notification", JSON.stringify({msg: "pripojenie bolo uspešne - zo zadanim hesla"}));
		connections[data["id"]].watchers[socket.id].valid = true;
		connections[data["id"]].owner.emit("getAllData", JSON.stringify({target: socket.id}));
	}
	else
		socket.emit("notification", JSON.stringify({msg: "zlé heslo"}));
};


/*
 * odpoji watchera alebo sharera
 */
disconnect = function(){
	var socket = this;
	for(var i in connections){
		if(connections.hasOwnProperty(i)){
			if(connections[i].owner.id == socket.id){
				//ODPOJIL SA SHARER
				for(var j in connections[i].watchers)
					if(connections[i].watchers.hasOwnProperty(j))
						connections[i].watchers[j].socket.emit("endShare", "endShare");
				console.log("SHARER s id " + socket.id + " sa odpojil");
				break;
			}
			else{
				if(typeof connections[i].watchers[socket.id] !== "undefined"){
					//ODPOJIL SA WATCHER
					delete connections[i].watchers[socket.id];
					console.log("watcher s id " + socket.id + " sa odpojil");
					break;
				}
			}
		}
	}
};


/*
 * odošle spravu všetkym pripojeným
 */
broadcastMsg = function(msg){
	var data = JSON.parse(msg);
	writeToWatchers(connections[data.id]["watchers"], "notification", JSON.stringify({msg: data["msg"]}));
};


/*
 * prijme od sharera všetky aktualne dáta
 */
sendAllData = function(msg){
	var data = JSON.parse(msg);
	console.log("boly prijatá všetky dáta od sharera a odosielju sa uživatelovy s id " + data.target);
	connections[data.id]["watchers"][data.target].socket.emit("sendAllData", JSON.stringify(data.content));
};


paintAction = function(msg){
	var data = JSON.parse(msg);
	//console.log("bola prijatá paintAction");
	writeToWatchers(connections[data.id].watchers, "paintAction", JSON.stringify(data.msg));
};


action = function(msg){
	var data = JSON.parse(msg);
	//console.log("bola prijatá akcia");
	writeToWatchers(connections[data.id].watchers, "action", JSON.stringify(data.msg));
};

mouseData = function(msg){
	var data = JSON.parse(msg);
	writeToWatchers(connections[data.id].watchers, "mouseData", JSON.stringify(data.msg));
};